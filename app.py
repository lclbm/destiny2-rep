import secrets
from pony.orm import select, count, db_session
from flask_caching import Cache
from flask import request, session, flash
from flask import Flask, abort, make_response, render_template, redirect, url_for

from src.database import DB, User, Comment

app = Flask(__name__)
cache = Cache(app, config={"CACHE_TYPE": "SimpleCache"})
app.secret_key = secrets.token_hex(16)


@app.route("/")
async def home():
    response = make_response(render_template("index.html"))
    return response


@app.route("/stats/")
@cache.cached(15)
async def stats():
    with db_session:
        user_count = count(u for u in User)
        comment_count = count(c for c in Comment)
        positive_comment_count = count(c for c in Comment if c.is_positive)
    resp = make_response(
        {
            "Response": {
                "user_count": user_count,
                "comment_count": comment_count,
                "positive_comment_count": positive_comment_count,
            }
        }
    )
    resp.access_control_allow_origin = "*"
    return resp, 200


@app.route("/login/")
async def login():
    session["is_logged_in"] = True
    return {"Response": {}}, 200


@app.route("/user/add/", methods=["POST"])
async def add_user():

    membership_type = request.form.get("membership_type", None)
    membership_id = request.form.get("membership_id", None)

    if not (membership_type and membership_id):
        return {"Response": {}, "Message": "Missing parameters"}, 400

    with db_session:
        if user := User.get(
            membership_type=membership_type, membership_id=membership_id
        ):
            return {"Response": {}, "Message": "User already exists"}, 400
        else:
            try:
                User(**request.form)
                return {"Response": {}}, 200
            except Exception as e:
                return {"Response": {}, "Message": str(e)}, 400


@app.after_request
def apply_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# start the server with the 'run()' method
if __name__ == "__main__":
    app.run(debug=True, ssl_context=("ca/cert.pem", "ca/key.pem"))
