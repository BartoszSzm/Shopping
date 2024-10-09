import typing as t

import redis
from fastapi.exceptions import HTTPException
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2
from fastapi.security.utils import get_authorization_scheme_param
from starlette.requests import Request
from starlette.status import HTTP_401_UNAUTHORIZED


class Blacklist:
    def __init__(self, redis_instance: redis.Redis):
        self.redis_instance = redis_instance

    def add(self, token: str, expiration: int):
        """Insert key to redis db. Raises exception when token string is empty"""
        if len(token) == 0:
            raise ValueError("Token cannot be empty")
        self.redis_instance.setex(token, expiration, "")

    def is_present(self, token: str) -> bool:
        """Check if given token exist in redis db"""
        return self.redis_instance.exists(token) > 0  # type: ignore


class OAuth2PasswordBearerWithCookie(OAuth2):
    """
    OAuth2 flow for authentication using a bearer token obtained with a password.
    Cheks for cookie instead of auth header
    """

    def __init__(
        self,
        tokenUrl: str,
        scheme_name: t.Optional[str] = None,
        scopes: t.Optional[t.Dict[str, str]] = None,
        description: t.Optional[str] = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(
            password=t.cast(t.Any, {"tokenUrl": tokenUrl, "scopes": scopes})
        )
        super().__init__(
            flows=flows,
            scheme_name=scheme_name,
            description=description,
            auto_error=auto_error,
        )

    async def __call__(self, request: Request) -> t.Optional[str]:
        authorization = request.cookies.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param
