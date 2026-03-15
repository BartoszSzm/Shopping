from unittest.mock import patch

import pytest
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from src.auth.auth import TokenData, get_token_data


@pytest.mark.asyncio
async def test_get_token_data_disable_auth():
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="any")

    with patch("src.auth.auth.config") as mock_config:
        mock_config.DISABLE_AUTH = True
        mock_config.DEV_USER_ID = "test-dev-user"

        result = await get_token_data(credentials=credentials)

        assert result.user_id == "test-dev-user"
        assert isinstance(result, TokenData)


@pytest.mark.asyncio
async def test_get_token_data_success():
    token = "secret-token"
    user_id = "user-123"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with patch("src.auth.auth.config") as mock_config:
        mock_config.DISABLE_AUTH = False
        mock_config.BACKEND_SERVICE_TOKEN = token

        result = await get_token_data(credentials=credentials, x_user_id=user_id)

        assert result.user_id == user_id


@pytest.mark.asyncio
async def test_get_token_data_invalid_token():
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="wrong-token"
    )

    with patch("src.auth.auth.config") as mock_config:
        mock_config.DISABLE_AUTH = False
        mock_config.BACKEND_SERVICE_TOKEN = "valid-token"

        with pytest.raises(HTTPException) as exc_info:
            await get_token_data(credentials=credentials, x_user_id="any-user")

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"


@pytest.mark.asyncio
async def test_get_token_data_missing_x_user_id():
    token = "valid-token"
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    with patch("src.auth.auth.config") as mock_config:
        mock_config.DISABLE_AUTH = False
        mock_config.BACKEND_SERVICE_TOKEN = token

        with pytest.raises(HTTPException) as exc_info:
            await get_token_data(credentials=credentials, x_user_id=None)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Missing X-User-Id header" in exc_info.value.detail
