import datetime
from pony.orm import *

db = Database()


class User(db.Entity):
    bungie_membership_id = Required(int, unique=True)
    membership_type = Required(str, max_len=1)
    membership_id = Required(str, max_len=19)
    last_login_time = Optional(datetime.datetime)
    tags = Optional(StrArray)

    received_comments = Set("Comment", reverse="to_user")
    sent_comments = Set("Comment", reverse="from_user")

    score = Optional(int)
    PrimaryKey(bungie_membership_id)


class Comment(db.Entity):
    id = PrimaryKey(int, auto=True)
    from_user = Required(User, reverse="sent_comments")
    to_user = Required(User, reverse="received_comments")

    is_positive = Required(bool)
    text = Required(LongStr)
    images = Optional(StrArray)
    create_time = Required(datetime.datetime, default=datetime.datetime.now)


if __name__ == "__main__":
    db.bind(provider="sqlite", filename="database.sqlite", create_db=True)
    db.generate_mapping(create_tables=True)

    # 创建数据
    with db_session:
        u1 = User(membership_type="3", membership_id="4611686018497181967")
        u2 = User(membership_type="2", membership_id="4611686018497181968")
        comment = Comment(
            from_user=u1,
            to_user=u2,
            text="nice from u1",
            images=["u1", "u2", "1.png"],
            is_positive=False,
        )
        comment = Comment(
            from_user=u1,
            to_user=u2,
            text="nice from u1",
            images=["u1", "u2", "2.png"],
            is_positive=True,
        )
        comment = Comment(
            from_user=u2,
            to_user=u1,
            text="nice from u2",
            images=["u2", "u1", "3.png"],
            is_positive=True,
        )

    # 读取数据
    with db_session:
        u1 = User["3", "4611686018497181967"]
        u2 = User["2", "4611686018497181968"]
        comments = list(Comment.select())
        for i in u1.sent_comments:
            print(i.text, i.images)
        for i in u1.received_comments:
            print(i.text, i.images)
