import secrets
from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src.config import Config, get_config


class TokenData(BaseModel):
    user_id: str


security = HTTPBearer()


async def get_token_data(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    config: Annotated[Config, Depends(get_config)],
    x_user_id: Annotated[Optional[str], Header()] = None,
) -> TokenData:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not secrets.compare_digest(
        config.BACKEND_SERVICE_TOKEN, credentials.credentials
    ):
        raise credentials_exception

    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header",
        )

    return TokenData(user_id=x_user_id)
