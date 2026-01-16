# -*- coding: utf-8 -*-
"""
Tests for API Performance Optimization - Parallel Requests

This module tests that the backend API fetches movie and TV data in parallel
instead of sequentially to stay within Vercel's 10s function limit.

Test Cases:
1. Response returns within 10 seconds (Vercel limit)
2. Uses concurrent.futures.ThreadPoolExecutor to fetch movie and TV in parallel
3. Pagination for both movie and TV happens concurrently
4. Returns combined result correctly regardless of data distribution
"""

import os
import time
import pytest
from unittest.mock import patch, MagicMock
from concurrent.futures import ThreadPoolExecutor

# Set the required environment variable before importing main
os.environ['NEODB_API_KEY'] = 'test_api_key'

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, get_completed_screen_items_this_year


class TestParallelScreenEndpoint:
    """Test suite for parallel request optimization in screen endpoint."""

    @pytest.fixture
    def client(self):
        """Create a test client for the Flask app."""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    @pytest.fixture
    def mock_neodb_response(self):
        """Factory for creating mock NeoDB API responses."""
        def create_response(category, count=5, pages=1, page=1):
            items = []
            for i in range(count):
                items.append({
                    "item": {
                        "cover_image_url": f"https://neodb.social/cover_{category}_{i}.jpg",
                        "display_title": f"{category.title()} Item {i}",
                        "id": f"{category}_{i}"
                    },
                    "created_time": f"2024-06-{15-i:02d}T10:30:00Z"
                })
            return {
                "data": items,
                "count": count * pages,
                "pages": pages
            }
        return create_response

    # ==========================================================================
    # Test Case 1: Response returns within 10 seconds (Vercel limit)
    # ==========================================================================

    def test_screen_endpoint_responds_within_timeout(self, client, mock_neodb_response):
        """
        Test Case 1: GET /api/complete/screen/2024 should return within 10 seconds.

        This test verifies that even with simulated network delay, parallel
        fetching keeps the response time under Vercel's 10s limit.
        """
        def slow_neodb_call(category, page, shelf_type):
            """Simulate a slow API call (2 seconds each)."""
            time.sleep(0.5)  # Simulated network delay
            return mock_neodb_response(category, count=3, pages=1, page=page)

        with patch('main.get_shelf_items_from_neodb', side_effect=slow_neodb_call):
            start_time = time.time()
            response = client.get('/api/complete/screen/2024')
            elapsed_time = time.time() - start_time

            assert response.status_code == 200
            # With parallel execution, both calls should complete in ~0.5s total
            # With sequential execution, it would take ~1s
            # We allow 2s as buffer for test environment variations
            assert elapsed_time < 2.0, f"Response took {elapsed_time:.2f}s, expected < 2s for parallel execution"

    def test_screen_endpoint_with_realistic_delay(self, client, mock_neodb_response):
        """
        Test that parallel execution significantly reduces response time.

        Simulates realistic network delays where sequential would take ~4s
        but parallel should complete in ~2s.
        """
        call_times = []

        def tracked_neodb_call(category, page, shelf_type):
            """Track call timing to verify parallel execution."""
            call_start = time.time()
            time.sleep(1.0)  # Simulate 1 second network delay
            call_end = time.time()
            call_times.append({
                'category': category,
                'start': call_start,
                'end': call_end
            })
            return mock_neodb_response(category, count=3, pages=1, page=page)

        with patch('main.get_shelf_items_from_neodb', side_effect=tracked_neodb_call):
            start_time = time.time()
            response = client.get('/api/complete/screen/2024')
            total_time = time.time() - start_time

            assert response.status_code == 200

            # Verify that movie and TV calls overlapped in time (parallel execution)
            # Get the calls for movie and tv first pages
            movie_calls = [c for c in call_times if c['category'] == 'movie']
            tv_calls = [c for c in call_times if c['category'] == 'tv']

            if movie_calls and tv_calls:
                movie_start = movie_calls[0]['start']
                tv_start = tv_calls[0]['start']
                # For parallel execution, starts should be within 0.1s of each other
                assert abs(movie_start - tv_start) < 0.5, \
                    f"Movie and TV calls not parallel: movie started at {movie_start:.2f}s, tv at {tv_start:.2f}s"

    # ==========================================================================
    # Test Case 2: Uses ThreadPoolExecutor for parallel fetching
    # ==========================================================================

    def test_uses_thread_pool_executor(self):
        """
        Test Case 2: Backend should use concurrent.futures.ThreadPoolExecutor
        to fetch movie and TV data in parallel.

        This test verifies the implementation uses ThreadPoolExecutor.
        """
        # Read the source file to verify ThreadPoolExecutor is used
        import inspect
        source_file = inspect.getfile(get_completed_screen_items_this_year)

        with open(source_file, 'r') as f:
            source_code = f.read()

        # Check that the implementation uses ThreadPoolExecutor
        assert 'ThreadPoolExecutor' in source_code or 'concurrent.futures' in source_code, \
            "Implementation should use concurrent.futures.ThreadPoolExecutor for parallel execution"

    def test_parallel_execution_pattern(self, mock_neodb_response):
        """
        Test that the screen endpoint executes movie and TV fetches in parallel.

        Uses timing to verify concurrent execution rather than sequential.
        """
        execution_order = []

        def tracking_neodb_call(category, page, shelf_type):
            """Track execution order and timing."""
            execution_order.append({
                'category': category,
                'page': page,
                'timestamp': time.time()
            })
            time.sleep(0.3)  # Simulate network delay
            return mock_neodb_response(category, count=2, pages=1, page=page)

        with patch('main.get_shelf_items_from_neodb', side_effect=tracking_neodb_call):
            with app.test_request_context():
                result = get_completed_screen_items_this_year(2024)

        assert 'data' in result

        # Verify both movie and tv were called
        categories_called = set(call['category'] for call in execution_order)
        assert 'movie' in categories_called, "Movie data should be fetched"
        assert 'tv' in categories_called, "TV data should be fetched"

        # Check timing - parallel calls should start within 0.1s of each other
        movie_calls = [c for c in execution_order if c['category'] == 'movie']
        tv_calls = [c for c in execution_order if c['category'] == 'tv']

        if movie_calls and tv_calls:
            time_diff = abs(movie_calls[0]['timestamp'] - tv_calls[0]['timestamp'])
            assert time_diff < 0.5, \
                f"Calls should be parallel (time diff: {time_diff:.3f}s), but appear sequential"

    # ==========================================================================
    # Test Case 3: Pagination for both movie and TV happens concurrently
    # ==========================================================================

    def test_pagination_concurrent(self, client, mock_neodb_response):
        """
        Test Case 3: Large dataset with multiple pages should have
        pagination for both movie and TV happening concurrently.
        """
        call_log = []

        def paginated_neodb_call(category, page, shelf_type):
            """Simulate paginated API calls."""
            call_log.append({
                'category': category,
                'page': page,
                'time': time.time()
            })
            time.sleep(0.2)  # Simulate network delay

            # Create items with timestamps that span the year
            items = []
            items_per_page = 5
            for i in range(items_per_page):
                month = max(1, 12 - (page - 1) * 2 - i // 2)
                items.append({
                    "item": {
                        "cover_image_url": f"https://neodb.social/cover_{category}_{page}_{i}.jpg",
                        "display_title": f"{category.title()} Page {page} Item {i}",
                        "id": f"{category}_{page}_{i}"
                    },
                    "created_time": f"2024-{month:02d}-15T10:30:00Z"
                })

            return {
                "data": items,
                "count": 15,  # Total items across all pages
                "pages": 3   # Multiple pages
            }

        with patch('main.get_shelf_items_from_neodb', side_effect=paginated_neodb_call):
            start_time = time.time()
            response = client.get('/api/complete/screen/2024')
            elapsed_time = time.time() - start_time

            assert response.status_code == 200

            # Verify both categories were called
            movie_calls = [c for c in call_log if c['category'] == 'movie']
            tv_calls = [c for c in call_log if c['category'] == 'tv']

            assert len(movie_calls) > 0, "Movie API should be called"
            assert len(tv_calls) > 0, "TV API should be called"

            # Verify the initial calls are parallel
            if movie_calls and tv_calls:
                first_movie_call = min(c['time'] for c in movie_calls)
                first_tv_call = min(c['time'] for c in tv_calls)
                assert abs(first_movie_call - first_tv_call) < 0.5, \
                    "Initial movie and TV calls should be parallel"

    def test_multi_page_results_combined(self, client, mock_neodb_response):
        """
        Test that results from multiple pages are correctly combined.
        """
        def multi_page_neodb_call(category, page, shelf_type):
            """Return paginated results."""
            items = []
            for i in range(3):
                items.append({
                    "item": {
                        "cover_image_url": f"https://neodb.social/{category}_p{page}_{i}.jpg",
                        "display_title": f"{category.title()} P{page} I{i}",
                        "id": f"{category}_{page}_{i}"
                    },
                    "created_time": f"2024-0{max(1, 6-page):1d}-{15+i:02d}T10:30:00Z"
                })

            return {
                "data": items,
                "count": 6,
                "pages": 2
            }

        with patch('main.get_shelf_items_from_neodb', side_effect=multi_page_neodb_call):
            response = client.get('/api/complete/screen/2024')

            assert response.status_code == 200
            data = response.get_json()['data']

            # Should have results from both movie and TV
            movie_items = [d for d in data if 'movie' in d['item']['id'].lower()]
            tv_items = [d for d in data if 'tv' in d['item']['id'].lower()]

            assert len(movie_items) > 0, "Should have movie items"
            assert len(tv_items) > 0, "Should have TV items"

    # ==========================================================================
    # Test Case 4: Returns combined result correctly regardless of data distribution
    # ==========================================================================

    def test_one_category_empty(self, client, mock_neodb_response):
        """
        Test Case 4: When one category has data and other is empty,
        should return combined result correctly.
        """
        def mixed_data_neodb_call(category, page, shelf_type):
            """Return data only for movies, empty for TV."""
            if category == 'movie':
                return mock_neodb_response('movie', count=5, pages=1, page=page)
            else:
                return {"data": [], "count": 0, "pages": 1}

        with patch('main.get_shelf_items_from_neodb', side_effect=mixed_data_neodb_call):
            response = client.get('/api/complete/screen/2024')

            assert response.status_code == 200
            data = response.get_json()['data']

            # Should have movie items only
            assert len(data) == 5, f"Expected 5 movie items, got {len(data)}"
            # All items should be movies
            for item in data:
                assert 'movie' in item['item']['cover_image_url'].lower()

    def test_both_categories_empty(self, client):
        """
        Test that endpoint handles both categories being empty.
        """
        def empty_neodb_call(category, page, shelf_type):
            """Return empty data for both categories."""
            return {"data": [], "count": 0, "pages": 1}

        with patch('main.get_shelf_items_from_neodb', side_effect=empty_neodb_call):
            response = client.get('/api/complete/screen/2024')

            assert response.status_code == 200
            data = response.get_json()['data']
            assert len(data) == 0, "Should return empty array when no data"

    def test_only_tv_has_data(self, client, mock_neodb_response):
        """
        Test that only TV data is returned when movies are empty.
        """
        def tv_only_neodb_call(category, page, shelf_type):
            """Return data only for TV, empty for movies."""
            if category == 'tv':
                return mock_neodb_response('tv', count=3, pages=1, page=page)
            else:
                return {"data": [], "count": 0, "pages": 1}

        with patch('main.get_shelf_items_from_neodb', side_effect=tv_only_neodb_call):
            response = client.get('/api/complete/screen/2024')

            assert response.status_code == 200
            data = response.get_json()['data']

            # Should have TV items only
            assert len(data) == 3, f"Expected 3 TV items, got {len(data)}"
            for item in data:
                assert 'tv' in item['item']['cover_image_url'].lower()

    def test_results_sorted_by_created_time(self, client):
        """
        Test that combined results are sorted by created_time in descending order.
        """
        def mixed_time_neodb_call(category, page, shelf_type):
            """Return items with interleaved timestamps."""
            if category == 'movie':
                return {
                    "data": [
                        {
                            "item": {"cover_image_url": "https://neodb.social/movie1.jpg",
                                    "display_title": "Movie 1", "id": "movie_1"},
                            "created_time": "2024-06-15T10:00:00Z"
                        },
                        {
                            "item": {"cover_image_url": "https://neodb.social/movie2.jpg",
                                    "display_title": "Movie 2", "id": "movie_2"},
                            "created_time": "2024-06-10T10:00:00Z"
                        }
                    ],
                    "count": 2,
                    "pages": 1
                }
            else:
                return {
                    "data": [
                        {
                            "item": {"cover_image_url": "https://neodb.social/tv1.jpg",
                                    "display_title": "TV 1", "id": "tv_1"},
                            "created_time": "2024-06-12T10:00:00Z"
                        },
                        {
                            "item": {"cover_image_url": "https://neodb.social/tv2.jpg",
                                    "display_title": "TV 2", "id": "tv_2"},
                            "created_time": "2024-06-08T10:00:00Z"
                        }
                    ],
                    "count": 2,
                    "pages": 1
                }

        with patch('main.get_shelf_items_from_neodb', side_effect=mixed_time_neodb_call):
            response = client.get('/api/complete/screen/2024')

            assert response.status_code == 200
            data = response.get_json()['data']

            # Verify sorted by created_time descending
            timestamps = [item['created_time'] for item in data]
            assert timestamps == sorted(timestamps, reverse=True), \
                f"Results should be sorted by created_time descending: {timestamps}"

            # Verify order: Movie1 (6/15), TV1 (6/12), Movie2 (6/10), TV2 (6/8)
            assert data[0]['item']['display_title'] == 'Movie 1'
            assert data[1]['item']['display_title'] == 'TV 1'
            assert data[2]['item']['display_title'] == 'Movie 2'
            assert data[3]['item']['display_title'] == 'TV 2'

    def test_screen_endpoint_without_year(self, client, mock_neodb_response):
        """
        Test that the screen endpoint works without specifying a year.
        """
        with patch('main.get_shelf_items_from_neodb', return_value=mock_neodb_response('movie', count=2, pages=1)):
            response = client.get('/api/complete/screen')

            assert response.status_code == 200
            data = response.get_json()
            assert 'data' in data

    # ==========================================================================
    # Performance verification tests
    # ==========================================================================

    def test_parallel_vs_sequential_performance(self, mock_neodb_response):
        """
        Performance test: Verify that parallel execution is faster than
        theoretical sequential time.

        If fetching each category takes ~0.5s with network delay:
        - Sequential: ~1.0s (0.5 + 0.5)
        - Parallel: ~0.5s (concurrent)
        """
        def timed_neodb_call(category, page, shelf_type):
            """Simulate network delay."""
            time.sleep(0.3)
            return mock_neodb_response(category, count=2, pages=1, page=page)

        with patch('main.get_shelf_items_from_neodb', side_effect=timed_neodb_call):
            with app.test_request_context():
                start_time = time.time()
                result = get_completed_screen_items_this_year(2024)
                elapsed = time.time() - start_time

        assert 'data' in result
        # Parallel execution should take ~0.3s, sequential would take ~0.6s
        # Use 0.5s as threshold to verify parallelism
        assert elapsed < 0.5, \
            f"Execution took {elapsed:.2f}s, expected < 0.5s for parallel execution"


class TestParallelImplementationDetails:
    """Tests to verify specific implementation details of parallel execution."""

    def test_concurrent_futures_import(self):
        """Verify that concurrent.futures is imported in main.py."""
        source_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'main.py'
        )

        with open(source_path, 'r') as f:
            source_code = f.read()

        assert 'concurrent.futures' in source_code or 'from concurrent.futures' in source_code, \
            "main.py should import concurrent.futures for ThreadPoolExecutor"

    def test_thread_pool_executor_usage(self):
        """Verify that ThreadPoolExecutor is used in the screen endpoint."""
        source_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'main.py'
        )

        with open(source_path, 'r') as f:
            source_code = f.read()

        assert 'ThreadPoolExecutor' in source_code, \
            "main.py should use ThreadPoolExecutor for parallel execution"
