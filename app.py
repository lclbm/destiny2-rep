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
@cache.cached(30)
async def stats():
    with db_session:
        user_count = count(u for u in User)
        comment_count = count(c for c in Comment)
        positive_comment_count = count(c for c in Comment if c.is_positive)
    return {
        "Response": {
            "user_count": user_count,
            "comment_count": comment_count,
            "positive_comment_count": positive_comment_count,
        }
    }


# start the server with the 'run()' method
if __name__ == "__main__":
    app.run(debug=True, ssl_context=("ca/cert.pem", "ca/key.pem"))
