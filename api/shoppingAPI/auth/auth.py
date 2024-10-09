import os
import typing as t
from datetime import datetime, timedelta, timezone

import jwt
import redis
from fastapi import Depends, HTTPException, status

from shoppingAPI.database.db import Users

from .utils import Blacklist, OAuth2PasswordBearerWithCookie
from .validation_models import *

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["ALGORITHM"]


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="token")

blacklist = Blacklist(redis.Redis(host="localhost", port=6379, decode_responses=True))


def is_token_revoked(token: str) -> bool:
    """Check if given token is revoked"""
    return blacklist.is_present(token)


def revoke_token(token: str, expiration: int) -> None:
    """Blacklist given token"""
    blacklist.add(token, expiration)


def create_access_token(
    data: t.Dict[t.Any, t.Any],
    secret_key: str,
    algorithm: str = "HS256",
    expires_delta: timedelta | None = None,
):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


async def validate_token(token: t.Annotated[str, Depends(oauth2_scheme)]) -> UserData:
    """Validate provided token, return associated user data and token data"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: t.Optional[str] = payload.get("sub")
        expiration: t.Optional[int] = payload.get("exp")
        if username is None or expiration is None:
            raise credentials_exception
        if is_token_revoked(token):
            raise credentials_exception
        token_data = TokenData(token=token, username=username, expiration=expiration)
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = Users.get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return UserData(user=user, token=token_data)


async def get_current_user(
    user_data: t.Annotated[UserData, Depends(validate_token)]
) -> Users:
    return user_data["user"]


async def get_token_data(
    user_data: t.Annotated[UserData, Depends(validate_token)]
) -> TokenData:
    return user_data["token"]


async def get_current_active_user(
    current_user: t.Annotated[Users, Depends(get_current_user)],
) -> Users:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
