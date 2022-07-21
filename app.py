import secrets
from uuid import uuid4
from webbrowser import get
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
async def home():
    cookies = request.cookies

    # 如果cookies中有token
    if token := cookies.get("token", None):
        token_data = TokenModel.parse_raw(token)

        # 如果refresh_token过期
        if token_data.is_refresh_token_expired:
            response = make_response(redirect(AUTHORIZATION_URL))
            response.delete_cookie("token")
            return response

        # 如果token过期，但refresh_token没过期
        if token_data.is_token_expired:
            token_data = await refresh_token(token_data.refresh_token)
            response = make_response("refresh token")
            response.set_cookie("token", token_data.json())
            return response

    # 如果cookies中没有token，则跳转到登录页面
    else:
        response = make_response(render_template("login.html",login_url=AUTHORIZATION_URL))
        return response


@app.route("/test")
def test():
    ...


@app.route("/auth/fetch_token", methods=["POST", "GET"])
# 用户点击登录按钮后在对应的bungie-oauth2完成认证后将会跳转到这个url
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
    app.run(debug=True, ssl_context=("ca/cert.pem", "ca/key.pem"))
