import secrets
from uuid import uuid4
from flask import Flask, abort, make_response, render_template, redirect, url_for
from flask import request, session, flash

from src.config import *
from src.bungie_api.model import TokenModel
from src.bungie_api.oauth import fetch_token, refresh_token

# create the application object
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# use decorators to link the function to a url
@app.route("/")
def home():
    cookies = request.cookies
    return redirect(AUTHORIZATION_URL)  # return a string


@app.route("/test")
def test():
    ...


@app.route("/auth/fetch_token", methods=["POST", "GET"])
async def login():
    if code := request.args.get("code", None):
        token_data = await fetch_token(code)
        response = make_response(
            render_template("token.html", token_data=token_data.json())
        )
        response.set_cookie("token", token_data.json(), max_age=token_data.expires_in)
        return response
    else:
        ...


@app.route("/auth/refresh_token", methods=["POST"])
async def refresh():
    if token_data := request.cookies.get("token", None):
        token_data = TokenModel.parse_raw(token_data)
        token_data = await refresh_token(token_data.refresh_token)
        response = make_response("refresh")
        response.set_cookie("token", token_data.json(), max_age=token_data.expires_in)
        return response
    else:
        ...


# start the server with the 'run()' method
if __name__ == "__main__":
    app.run(debug=True, ssl_context=("ca/cert.pem", "ca/key.pem"), use_reloader=False)
