import datetime
import peewee
import pydantic

db = peewee.SqliteDatabase("data.db")


class BaseModel(peewee.Model):
    class Meta:
        database = db


class User(BaseModel):
    membership_type = peewee.FixedCharField(max_length=1)
    membership_id = peewee.FixedCharField(max_length=19, index=True)
    last_login_time = peewee.DateTimeField(null=True)

    class Meta:
        table_name = "user"
        primary_key = peewee.CompositeKey("membership_type", "membership_id")


class UserModel(pydantic.BaseModel):
    class Config:
        orm_mode = True

    membership_type: pydantic.constr(max_length=1)
    membership_id: pydantic.constr(max_length=19)
    last_login_time: datetime.datetime | None


class Content(BaseModel):
    id = peewee.AutoField(index=True)
    text = peewee.TextField()
    images = peewee.TextField(null=True)

    class Meta:
        table_name = "content"


class ContentModel(pydantic.BaseModel):
    class Config:
        orm_mode = True

    id: int
    text: str
    images: str | None


class History(BaseModel):
    from_user = peewee.ForeignKeyField(User, field="membership_id", index=True,backref="from_user")
    to_user = peewee.ForeignKeyField(User, field="membership_id",backref="to_user")
    content = peewee.ForeignKeyField(Content, field="id")
    create_time = peewee.DateTimeField()

    class Meta:
        table_name = "history"


class HistoryModel(pydantic.BaseModel):
    class Config:
        orm_mode = True

    from_user: UserModel
    to_user: UserModel
    content: ContentModel
    create_time: datetime.datetime


if __name__ == "__main__":
    db.connect()
    db.create_tables([User, Content, History])

    # with db.transaction():
    #     user1 = User.create(
    #         membership_type="3",
    #         membership_id="4611686018497181967",
    #         last_login_time=datetime.datetime.now(),
    #     )
    #     user2 = User.create(
    #         membership_type="2",
    #         membership_id="4611686018497181964",
    #         last_login_time=datetime.datetime.now(),
    #     )
    #     content = Content.create(text="Hello, World!")
    #     History.create(
    #         from_user=user1,
    #         to_user=user2,
    #         content=content,
    #         create_time=datetime.datetime.now(),
    #     )
    _ = (
        History.select()
        .join(User, on=History.to_user)
        .switch(History)
        .join(User, on=History.from_user)
    )

    for i in _:
        content = Content.from_orm(i)
        print(content)
