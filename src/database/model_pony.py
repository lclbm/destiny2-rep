import datetime
from pony.orm import *
import pydantic

db = Database()


class User(db.Entity):
    membership_type = Required(str, max_len=1)
    membership_id = Required(str, max_len=19, unique=True)
    last_login_time = Optional(datetime.datetime)
    received_comments = Set("Comment", reverse="to_user")
    sent_comments = Set("Comment", reverse="from_user")
    PrimaryKey(membership_type, membership_id)


class Comment(db.Entity):
    from_user = Required(User, reverse="sent_comments")
    to_user = Required(User, reverse="received_comments")
    text = Required(LongStr)
    images = Optional(StrArray)
    create_time = Required(datetime.datetime)


if __name__ == "__main__":
    db.bind(provider="sqlite", filename="database.sqlite", create_db=True)
    db.generate_mapping(create_tables=True)
