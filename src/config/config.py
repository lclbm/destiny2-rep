import os
from dotenv import load_dotenv

load_dotenv(override=True)
X_API_KEY = os.getenv("X-API-Key")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
AUTHORIZATION_URL = f"https://www.bungie.net/zh-chs/oauth/authorize?client_id={CLIENT_ID}&response_type=code"

__all__ = ["X_API_KEY", "CLIENT_ID", "CLIENT_SECRET", "AUTHORIZATION_URL"]
