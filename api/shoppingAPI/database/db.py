from __future__ import annotations

import os
import typing as t
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.orm as so
from passlib.context import CryptContext
from pydantic import BaseModel

DB_URL = os.environ["DB_URL"]

engine = sa.create_engine(DB_URL)
db_session = so.sessionmaker(autocommit=False, autoflush=False, bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenDecodingError(Exception):
    pass


class Base(so.DeclarativeBase):
    pass


class ItemType(str, Enum):
    fruit = "FaAppleAlt"
    diary = "FaCheese"
    ready_made = "FaUtensils"
    unknown = "FaRegQuestionCircle"


class TokenData(BaseModel):
    user_id: str


class Users(Base):
    __tablename__ = "users"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(
        sa.String(300), unique=True, nullable=False
    )
    disabled: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    hashed_password: so.Mapped[str] = so.mapped_column(sa.String(500))

    @staticmethod
    def authenticate_user(username: str, password: str) -> Users | t.Literal[False]:
        user = Users.get_user(username)
        if not user:
            return False
        if not Users.verify_password(password, user.hashed_password):
            return False
        return user

    @staticmethod
    def new_user(username: str, password: str) -> None:
        with db_session() as session:
            session.add(
                Users(
                    username=username, hashed_password=Users.get_password_hash(password)
                )
            )
            session.commit()

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_user(username: str) -> t.Optional[Users]:
        with db_session() as session:
            return session.query(Users).filter_by(username=username).first()


class ShoppingList(Base):
    __tablename__ = "shoppingList"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), unique=True)
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    items: so.Mapped[t.List["ListItem"]] = so.relationship(
        back_populates="list", cascade="all,delete"
    )


class ListItem(Base):
    __tablename__ = "listItem"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), unique=True)
    list_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("shoppingList.id", ondelete="CASCADE")
    )
    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, default=1)
    typeicon: so.Mapped[ItemType] = so.mapped_column(sa.Enum(ItemType))
    buyed: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    list: so.Mapped["ShoppingList"] = so.relationship(back_populates="items")


class ItemTypes(Base):
    __tablename__ = "itemTypes"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), unique=True)
    typeicon: so.Mapped[ItemType] = so.mapped_column(sa.Enum(ItemType))

    def get_typeicon(self, item_name: str) -> t.Optional[str]:
        with db_session() as session:
            row = (
                session.query(ItemTypes)
                .filter(ItemTypes.name.like(f"%{item_name.lower()}%"))
                .first()
            )
            if row:
                return row.typeicon.value
            else:
                return ItemType.unknown


def create_db() -> None:
    Base.metadata.create_all(engine)


def create_dummy_list() -> None:
    with db_session() as session:
        lists = session.query(ShoppingList).all()
        if not lists:
            session.add(ShoppingList(name="test"))
            session.commit()
