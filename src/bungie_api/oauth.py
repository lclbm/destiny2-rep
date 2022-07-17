import aiohttp
from typing import Literal
from ..config import *
from .model import TokenModel

ACCESS_TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/"


async def request(url: str, method: Literal["POST", "GET"], **kwargs) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.request(method, url, **kwargs) as response:
            return await response.json()


async def fetch_token(code: str) -> TokenModel:
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "Content-Type": "application/x-www-form-urlencoded",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    _ = await request(ACCESS_TOKEN_URL, "POST", data=payload)
    return TokenModel(**_)


async def refresh_token(refresh_token: str) -> TokenModel:
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "Content-Type": "application/x-www-form-urlencoded",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    _ = await request(ACCESS_TOKEN_URL, "POST", data=payload)
    return TokenModel(**_)
