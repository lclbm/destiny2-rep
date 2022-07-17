# import the Flask class from the flask module
from flask import Flask, render_template, redirect, url_for
from flask import request, session, flash
from src.config import *
from src.bungie_api.oauth import fetch_token, refresh_token

# create the application object
app = Flask(__name__)

# use decorators to link the function to a url
@app.route("/")
def home():
    return redirect(AUTHORIZATION_URL)  # return a string


@app.route("/welcome")
def welcome():
    return render_template("welcome.html")  # render a template


# Route for handling the login page logic
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        if request.form["username"] != "admin" or request.form["password"] != "admin":
            error = "Invalid Credentials. Please try again."
        else:
            return redirect(url_for("home"))
    return render_template("login.html", error=error)


@app.route("/auth")
async def auth():
    if code := request.args.get("code", None):
        token_data = await fetch_token(code)
    else:
        ...


# start the server with the 'run()' method
if __name__ == "__main__":
    app.run(debug=True, ssl_context=("ca/cert.pem", "ca/key.pem"), use_reloader=False)
