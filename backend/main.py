# -*- coding: utf-8 -*-
import os
from datetime import date
import requests

from flask import Flask, request
from flask_cors import CORS, cross_origin


NEODB_DOMAIN = "https://neodb.social/"
BOOK_API_URL = NEODB_DOMAIN + "api/book/"
SHELF_API_URL = NEODB_DOMAIN + "api/me/shelf/"

NEODB_API_KEY = os.environ.get('NEODB_API_KEY', '')
if not NEODB_API_KEY:
    raise Exception("No NEODB_API_KEY")

AUTHORIZATION = f"Bearer {os.environ.get('NEODB_API_KEY', '')}"

IMAGE_THUMBNAIL_SUFFIX = ".200x200_q85_autocrop_crop-scale.jpg"


app = Flask(__name__)
CORS(app)


@app.route("/api/")
def index():
    return "Alive!"


def get_start_date_of_year(year):
    dt_fmt = "{year}-01-01T00:00:00Z"
    if not year:
        year = date.today().year

    return dt_fmt.format(year=year)


def get_end_date_of_year(year):
    dt_fmt = "{year}-12-31T23:59:59Z"
    if not year:
        year = date.today().year

    return dt_fmt.format(year=year)


@app.route("/api/complete/<category>")
@app.route("/api/complete/<category>/<year>")
def get_completed_items_this_year(category, year=0):
    if category not in ("book", "music", "game", "movie", "tv"):
        return "invalid category", 400

    current_page = 1
    start_date_of_this_year = get_start_date_of_year(year)
    end_date_of_this_year = get_end_date_of_year(year)

    resp = get_shelf_items_from_neodb(category, current_page, "complete")
    completed_items = resp["data"]
    if (
        not completed_items
        or resp["count"] == len(completed_items)  # all finish
        or resp["pages"] == 1
        or completed_items[-1]["created_time"] < start_date_of_this_year
    ):
        return {
            "data": [
                item
                for item in completed_items
                if start_date_of_this_year
                <= item["created_time"]
                <= end_date_of_this_year
            ]
        }

    total = resp["pages"]
    while True:
        current_page += 1
        completed_items += get_shelf_items_from_neodb(
            category, current_page, "complete"
        )["data"]
        if (
            current_page == total
            or completed_items[-1]["created_time"] < start_date_of_this_year
        ):
            return {
                "data": [
                    item
                    for item in completed_items
                    if start_date_of_this_year
                    <= item["created_time"]
                    <= end_date_of_this_year
                ]
            }


@app.route("/api/complete/screen")
@app.route("/api/complete/screen/<year>")
def get_completed_screen_items_this_year(year=0):
    movies = get_completed_items_this_year("movie", year)["data"]
    tvs = get_completed_items_this_year("tv", year)["data"]

    return {"data": sorted(movies + tvs, key=lambda x: x["created_time"], reverse=True)}


def get_shelf_items_from_neodb(category, page, shelf_type):
    req = requests.get(
        SHELF_API_URL + shelf_type,
        params={"category": category, "page": page},
        headers={"Authorization": AUTHORIZATION},
    )
    result = req.json()

    if "data" not in result:
        raise Exception(result)

    for item in result["data"]:
        item["item"]["cover_image_url"] = item["item"]["cover_image_url"] + \
            IMAGE_THUMBNAIL_SUFFIX

    return result


if __name__ == "__main__":
    app.run(port=9527, debug=True)
