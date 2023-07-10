# -*- coding: utf-8 -*-
import os
from datetime import date
import requests

from flask import Flask, request
from flask_cors import CORS, cross_origin


NEODB_DOMAIN = "https://neodb.social/"
BOOK_API_URL = NEODB_DOMAIN + "api/book/"
SHELF_API_URL = NEODB_DOMAIN + "api/me/shelf/"
AUTHORIZATION = f"Bearer {os.environ.get('NEODB_API_KEY', '')}"


app = Flask(__name__)
CORS(app)


@app.route("/")
def index():
    return "Alive!"


@app.route("/book/<book_id>")
def get_book(book_id):
    req = requests.get(BOOK_API_URL + str(book_id))
    return req.json()


def get_start_date_of_this_year():
    return f"{date.today().year}-01-01T00:00:00Z"


@app.route("/complete/<category>")
def get_completed_items_this_year(category):
    if category not in ("book", "music", "game", "movie", "tv"):
        return "invalid category", 400

    current_page = 1
    start_date_of_this_year = get_start_date_of_this_year()

    resp = get_shelf_items_from_neodb(category, current_page, "complete")
    if 'data' not in resp:
        print("err:", resp)
        raise
    completed_items = resp["data"]
    if (
        resp["count"] == len(completed_items)
        or resp["pages"] == 1
        or not completed_items
        or completed_items[-1]["created_time"] < start_date_of_this_year
    ):
        return {"data": [item for item in completed_items if item["created_time"] >= start_date_of_this_year]}

    total = resp["pages"]
    while True:
        current_page += 1
        new_page_data = get_shelf_items_from_neodb(category, current_page, "complete")["data"]
        completed_items.extend(new_page_data)
        if current_page == total or completed_items[-1]["created_time"] < start_date_of_this_year:
            return {"data": [item for item in completed_items if item["created_time"] >= start_date_of_this_year]}


@app.route("/complete/screen")
def get_completed_screen_items_this_year():

    movies = get_completed_items_this_year("movie")["data"]
    tvs = get_completed_items_this_year("tv")["data"]


    return {"data": sorted(movies + tvs, key=lambda x: x["created_time"], reverse=True)}


def get_shelf_items_from_neodb(category, page, shelf_type):
    req = requests.get(
        SHELF_API_URL + shelf_type,
        params={"category": category, "page": page},
        headers={"Authorization": AUTHORIZATION},
    )
    return req.json()


# if __name__ == "__main__":
    # app.run("0.0.0.0", port=9527, debug=True)
