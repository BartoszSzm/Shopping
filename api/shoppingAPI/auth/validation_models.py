from typing import TypedDict

from pydantic import BaseModel

from shoppingAPI.database import Users


class Login(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    token: str
    username: str
    expiration: int


class User(BaseModel):
    username: str
    disabled: bool


class UserData(TypedDict):
    user: Users
    token: TokenData
