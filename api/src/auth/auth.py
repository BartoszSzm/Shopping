from typing import Annotated, Optional
from uuid import UUID

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel

from src.config import config


class TokenData(BaseModel):
    user_id: UUID | int


oauth2_scheme = HTTPBearer(auto_error=False)


def introspect_token(
    token: str,
    timeout: float = 5.0,
    client_secret: str = config.KEYCLOAK_CLIENT_SECRET,
    client_id: str = config.KEYCLOAK_CLIENT_ID,
    realm: str = config.KEYCLOAK_REALM,
    keycloak_base_url: str = config.KEYCLOAK_BASE_URL,
) -> bool:

    introspection_url = (
        f"{keycloak_base_url}/realms/{realm}/protocol/openid-connect/token/introspect"
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
    return bool(payload.get("active", False))


async def _get_token_data(token: str) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        active = introspect_token(token)
        if not active:
            raise credentials_exception
    except Exception as exc:
        print(exc)
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            algorithms=[config.ALGORITHM],
            options={"verify_signature": False},
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        return TokenData(user_id=user_id)

    except InvalidTokenError:
        raise credentials_exception


async def get_token_data(
    token: Annotated[Optional[str], Depends(oauth2_scheme)],
) -> TokenData:
    if config.DISABLE_AUTH:
        return TokenData(user_id=config.DEV_USER_ID)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await _get_token_data(token)
