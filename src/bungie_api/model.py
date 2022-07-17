import datetime
from pydantic import BaseModel, Field


class TokenModel(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    membership_id: str

    expires_in: int
    refresh_expires_in: int

    expire_time: datetime.datetime = None
    refresh_expire_time: datetime.datetime = None
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

    def __init__(self, **data) -> None:
        super().__init__(**data)
        self.expire_time = datetime.datetime.now() + datetime.timedelta(
            seconds=self.expires_in
        )
        self.refresh_expire_time = datetime.datetime.now() + datetime.timedelta(
            seconds=self.refresh_expires_in
        )
