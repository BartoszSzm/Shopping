from typing import Annotated
from uuid import UUID

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from shoppingAPI.config import config

ALGORITHM = config.ALGORITHM
KEYCLOAK_BASE_URL = config.KEYCLOAK_BASE_URL
KEYCLOAK_REALM = config.KEYCLOAK_REALM
KEYCLOAK_CLIENT_ID = config.KEYCLOAK_CLIENT_ID
KEYCLOAK_CLIENT_SECRET = config.KEYCLOAK_CLIENT_SECRET


class TokenData(BaseModel):
    user_id: UUID


oauth2_scheme = HTTPBearer()


def introspect_token(
    token: str,
    timeout: float = 5.0,
    client_secret: str = KEYCLOAK_CLIENT_SECRET,
    client_id: str = KEYCLOAK_CLIENT_ID,
    realm: str = KEYCLOAK_REALM,
    keycloak_base_url: str = KEYCLOAK_BASE_URL,
) -> bool:

    introspection_url = (
        f"{keycloak_base_url}/realms/{realm}"
        "/protocol/openid-connect/token/introspect"
    )

    data = {
        "token": token,
        "client_id": client_id,
        "client_secret": client_secret,
    }

    with httpx.Client(timeout=timeout) as client:
        response = client.post(
            introspection_url,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    response.raise_for_status()
    payload = response.json()
    print(payload)
    return bool(payload.get("active", False))


async def get_token_data(
    token: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)],
):
    access_token = token.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        active = introspect_token(access_token)
        if not active:
            raise credentials_exception
    except Exception as exc:
        print(exc)
        raise credentials_exception

    try:
        payload = jwt.decode(
            access_token, algorithms=[ALGORITHM], options={"verify_signature": False}
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    return token_data
