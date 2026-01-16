# -*- coding: utf-8 -*-
"""
Tests for early termination logic in the API pagination.

These tests verify that the backend API correctly implements early termination
to stop fetching pages once all items for the target year have been retrieved.
This prevents unnecessary API calls to NeoDB for older years.
"""
import json
import os
import pytest
import responses
from unittest.mock import patch

# Set required environment variable before importing main
os.environ['NEODB_API_KEY'] = 'test-api-key'

from main import (
    app,
    get_start_date_of_year,
    get_end_date_of_year,
    get_shelf_items_from_neodb,
    SHELF_API_URL,
)


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def create_neodb_response(items, page, total_pages, count):
    """Create a mock NeoDB API response as a dict."""
    return {
        "data": items,
        "page": page,
        "pages": total_pages,
        "count": count
    }


def create_item(created_time, title="Test Item"):
    """Helper to create a mock item with a created_time."""
    return {
        "item": {
            "cover_image_url": "https://neodb.social/m/item/test.jpg",
            "display_title": title,
            "id": f"item-{created_time}"
        },
        "created_time": created_time
    }


class TestEarlyTerminationLogic:
    """Test cases for early termination in pagination."""

    # Test Case 2: Unit test for pagination termination logic
    @responses.activate
    def test_loop_terminates_when_oldest_item_before_year_start(self, client):
        """
        Test Case 2: Pagination logic check
        Loop terminates when oldest item's created_time < start_date_of_year

        This is a unit test that verifies the early termination logic:
        - The loop should stop fetching pages when the oldest item on the current
          page has a created_time before the start of the target year.
        """
        # Page 1: Items from 2024 (most recent first, as NeoDB returns)
        page1_items = [
            create_item("2024-12-15T10:00:00Z", "Item 1"),
            create_item("2024-06-15T10:00:00Z", "Item 2"),
        ]

        # Page 2: Items spanning into 2023 (oldest is before 2024)
        page2_items = [
            create_item("2024-01-15T10:00:00Z", "Item 3"),
            create_item("2023-11-15T10:00:00Z", "Item 4 - OLD"),  # Before 2024
        ]

        # Page 3: Should NOT be fetched due to early termination
        page3_items = [
            create_item("2023-06-15T10:00:00Z", "Item 5 - SHOULD NOT BE FETCHED"),
            create_item("2022-06-15T10:00:00Z", "Item 6 - SHOULD NOT BE FETCHED"),
        ]

        api_calls = []

        def request_callback(request):
            api_calls.append(request.url)
            page = int(request.params.get('page', 1))

            if page == 1:
                body = create_neodb_response(page1_items, 1, 3, 6)
            elif page == 2:
                body = create_neodb_response(page2_items, 2, 3, 6)
            else:
                body = create_neodb_response(page3_items, 3, 3, 6)

            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        # Request items for 2024
        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should only have items from 2024
        assert len(data["data"]) == 3  # Items 1, 2, 3

        # Verify early termination: Only 2 API calls, not 3
        assert len(api_calls) == 2, f"Expected 2 API calls but made {len(api_calls)}: {api_calls}"

        # Verify the items returned are only from 2024
        for item in data["data"]:
            assert item["created_time"].startswith("2024-")


class TestIntegrationEarlyTermination:
    """Integration tests for the API performance optimization."""

    # Test Case 1: User with items across multiple years
    @responses.activate
    def test_fetches_only_pages_needed_for_target_year(self, client):
        """
        Test Case 1: User with 20 items in 2024, 50 items in previous years
        Backend fetches only enough pages to cover 2024 items, not all historical data.

        This tests that when a user has many items across multiple years,
        the API only fetches pages until it has all items for the target year.
        """
        # Simulate 20 items in 2024 spread across 2 pages (10 per page)
        # Plus 50 items in previous years that should NOT be fetched

        # Page 1: 10 items from late 2024
        page1_items = [
            create_item(f"2024-{12-i:02d}-15T10:00:00Z", f"2024 Item {i+1}")
            for i in range(10)
        ]

        # Page 2: 10 items from early 2024 + some from 2023
        page2_items = [
            create_item("2024-02-15T10:00:00Z", "2024 Item 11"),
            create_item("2024-02-10T10:00:00Z", "2024 Item 12"),
            create_item("2024-01-25T10:00:00Z", "2024 Item 13"),
            create_item("2024-01-20T10:00:00Z", "2024 Item 14"),
            create_item("2024-01-15T10:00:00Z", "2024 Item 15"),
            create_item("2024-01-10T10:00:00Z", "2024 Item 16"),
            create_item("2024-01-05T10:00:00Z", "2024 Item 17"),
            create_item("2024-01-03T10:00:00Z", "2024 Item 18"),
            create_item("2024-01-02T10:00:00Z", "2024 Item 19"),
            create_item("2023-12-15T10:00:00Z", "2023 Item - triggers early termination"),
        ]

        # Pages 3-7 would contain 50 items from previous years - should NOT be fetched

        api_calls = []

        def request_callback(request):
            api_calls.append(request.params.get('page', '1'))
            page = int(request.params.get('page', 1))

            if page == 1:
                body = create_neodb_response(page1_items, 1, 7, 70)
            elif page == 2:
                body = create_neodb_response(page2_items, 2, 7, 70)
            else:
                # Should not reach here
                body = create_neodb_response([], page, 7, 70)

            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should have exactly 19 items from 2024
        assert len(data["data"]) == 19

        # Verify only 2 API calls were made (not 7)
        assert len(api_calls) == 2, f"Expected 2 API calls but made {len(api_calls)}"

        # Verify all returned items are from 2024
        for item in data["data"]:
            assert item["created_time"].startswith("2024-"), f"Found non-2024 item: {item['created_time']}"

    # Test Case 3: Year with items only on first page
    @responses.activate
    def test_single_api_call_when_items_only_on_first_page(self, client):
        """
        Test Case 3: Year with items only on first page
        Only 1 API call made to NeoDB.

        When all items for the target year fit on the first page,
        no additional pages should be fetched.
        """
        # Page 1: 5 items from 2024 and oldest is from 2023
        page1_items = [
            create_item("2024-12-15T10:00:00Z", "Item 1"),
            create_item("2024-10-15T10:00:00Z", "Item 2"),
            create_item("2024-08-15T10:00:00Z", "Item 3"),
            create_item("2024-06-15T10:00:00Z", "Item 4"),
            create_item("2024-04-15T10:00:00Z", "Item 5"),
            create_item("2023-12-15T10:00:00Z", "Old Item"),  # Before 2024 - triggers early exit
        ]

        api_calls = []

        def request_callback(request):
            api_calls.append(request.params.get('page', '1'))
            body = create_neodb_response(page1_items, 1, 5, 50)
            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should have 5 items from 2024
        assert len(data["data"]) == 5

        # Verify ONLY 1 API call was made
        assert len(api_calls) == 1, f"Expected 1 API call but made {len(api_calls)}"

        # All items should be from 2024
        for item in data["data"]:
            assert item["created_time"].startswith("2024-")

    # Test Case 4: Empty year
    @responses.activate
    def test_empty_year_returns_empty_without_excessive_calls(self, client):
        """
        Test Case 4: Empty year (no items)
        Returns empty array without excessive API calls.

        When requesting data for a year with no items, the API should:
        - Return an empty array
        - Make minimal API calls (ideally just one to check)
        """
        # All items are from 2023 - nothing from 2024
        page1_items = [
            create_item("2023-12-15T10:00:00Z", "2023 Item 1"),
            create_item("2023-10-15T10:00:00Z", "2023 Item 2"),
            create_item("2023-08-15T10:00:00Z", "2023 Item 3"),
        ]

        api_calls = []

        def request_callback(request):
            api_calls.append(request.params.get('page', '1'))
            body = create_neodb_response(page1_items, 1, 5, 50)
            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        # Request items for 2024 - but user has no 2024 items
        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should return empty array
        assert data["data"] == []

        # Should make only 1 API call
        assert len(api_calls) == 1, f"Expected 1 API call but made {len(api_calls)}"


class TestDateHelperFunctions:
    """Tests for the date helper functions used in early termination."""

    def test_get_start_date_of_year(self):
        """Test start date calculation for a year."""
        assert get_start_date_of_year(2024) == "2024-01-01T00:00:00Z"
        assert get_start_date_of_year(2023) == "2023-01-01T00:00:00Z"
        assert get_start_date_of_year(2020) == "2020-01-01T00:00:00Z"

    def test_get_end_date_of_year(self):
        """Test end date calculation for a year."""
        assert get_end_date_of_year(2024) == "2024-12-31T23:59:59Z"
        assert get_end_date_of_year(2023) == "2023-12-31T23:59:59Z"
        assert get_end_date_of_year(2020) == "2020-12-31T23:59:59Z"


class TestEdgeCases:
    """Edge case tests for early termination logic."""

    @responses.activate
    def test_items_exactly_at_year_boundary(self, client):
        """Test handling of items exactly at year start/end boundaries."""
        # Items at exact year boundaries
        page1_items = [
            create_item("2024-12-31T23:59:59Z", "Last item of 2024"),
            create_item("2024-01-01T00:00:00Z", "First item of 2024"),
            create_item("2023-12-31T23:59:59Z", "Last item of 2023"),  # Should not be included
        ]

        api_calls = []

        def request_callback(request):
            api_calls.append(request.params.get('page', '1'))
            body = create_neodb_response(page1_items, 1, 1, 3)
            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should include both 2024 items (including boundary items)
        assert len(data["data"]) == 2
        assert data["data"][0]["created_time"] == "2024-12-31T23:59:59Z"
        assert data["data"][1]["created_time"] == "2024-01-01T00:00:00Z"

    @responses.activate
    def test_completely_empty_response(self, client):
        """Test handling when NeoDB returns no items at all."""
        def request_callback(request):
            body = create_neodb_response([], 1, 0, 0)
            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()
        assert data["data"] == []

    @responses.activate
    def test_all_items_on_single_page(self, client):
        """Test when all user's items fit on a single page."""
        page1_items = [
            create_item("2024-12-15T10:00:00Z", "Item 1"),
            create_item("2024-06-15T10:00:00Z", "Item 2"),
        ]

        api_calls = []

        def request_callback(request):
            api_calls.append(request.params.get('page', '1'))
            body = create_neodb_response(page1_items, 1, 1, 2)
            return (200, {}, json.dumps(body))

        responses.add_callback(
            responses.GET,
            f"{SHELF_API_URL}complete",
            callback=request_callback,
            content_type="application/json"
        )

        response = client.get('/api/complete/book/2024')

        assert response.status_code == 200
        data = response.get_json()

        # Should have both items
        assert len(data["data"]) == 2

        # Should make only 1 API call (pages == 1 condition)
        assert len(api_calls) == 1
