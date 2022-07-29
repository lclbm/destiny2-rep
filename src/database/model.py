import datetime
from pony.orm import *

db = Database()


class User(db.Entity):
    bungie_membership_id = Optional(int)
    membership_type = Required(int)
    membership_id = Required(int, size=64)
    tags = Optional(StrArray)

    received_comments = Set("Comment", reverse="to_user")
    sent_comments = Set("Comment", reverse="from_user")

    score = Optional(int, default=0)
    PrimaryKey(membership_type, membership_id)


class Comment(db.Entity):
    id = PrimaryKey(int, auto=True)
    from_user = Required(User, reverse="sent_comments")
    to_user = Required(User, reverse="received_comments")

    is_positive = Required(bool)
    text = Required(LongStr)
    images = Optional(StrArray)
    create_time = Required(datetime.datetime, default=datetime.datetime.now)


db.bind(provider="sqlite", filename="database.sqlite", create_db=True)
db.generate_mapping(create_tables=True)


if __name__ == "__main__":

    with db_session:
        u1 = User(
            membership_type="3",
            membership_id="4611686018497181967",
            bungie_membership_id="12345",
        )
        u2 = User(membership_type="3", membership_id="4611686018497181968")
        u3 = User(
            membership_type="3", membership_id="123456", bungie_membership_id=None
        )

    with db_session:
        u_1 = User["3", "4611686018497181967"]
        u_2 = User["3", "4611686018497181968"]
        u_list = User.select()[:]
        u_test = User.select(lambda u: u.membership_id == "4611686018497181967")
        ...
