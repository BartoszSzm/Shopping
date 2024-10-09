import re
import secrets
import time

import jwt
import pytest
import redis

from shoppingAPI import auth


class TestCreateAccessToken:

    @pytest.fixture
    def secret_key(self):
        yield secrets.token_hex(32)

    def test_create_access_token_basic(self, secret_key: str):
        """Ensure that the function generates a valid JWT (JSON Web Token)
        when provided with a standard data dictionary and no expires_delta"""
        token = auth.create_access_token({"sub": "Bartosz"}, secret_key=secret_key)
        jwt.decode(token, secret_key, algorithms=["HS256"])
        assert (
            re.match("^[A-Za-z0-9-_]+\.([A-Za-z0-9-_]+)\.([A-Za-z0-9-_]+)$", token)  # type: ignore
            != None
        )

    def test_create_access_token_expiration_default(self, secret_key: str):
        pass

    def test_create_access_token_expiration_custom(self, secret_key: str):
        pass

    def test_create_access_token_payload_encoding(self, secret_key: str):
        pass


class TestBlacklist:

    @pytest.fixture
    def db(self):
        redis_instance = redis.Redis()
        yield redis_instance
        redis_instance.flushdb()  # type: ignore
        redis_instance.close()

    def test_add_in_db(self, db: redis.Redis):
        """Test if add method adds record to specific redis instance"""
        auth.Blacklist(db).add("sometoken", 999999)
        assert db.exists("sometoken") == 1
        assert len(list(db.keys())) == 1  # type: ignore

    def test_add_expire(self, db: redis.Redis):
        """Test if added record expires according to the argument value"""
        auth.Blacklist(db).add("sometoken", 2)
        time.sleep(3)
        assert db.exists("sometoken") == 0
        assert len(list(db.keys())) == 0  # type: ignore

    def test_add_empty(self, db: redis.Redis):
        """Test if method raises exception on empty value"""
        with pytest.raises(ValueError):
            auth.Blacklist(db).add("", 999)

    def test_is_present_ok(self, db: redis.Redis):
        """Check if method returns correctly"""
        db.set("sometoken", "")
        assert auth.Blacklist(db).is_present("sometoken") == True
        assert auth.Blacklist(db).is_present("sometoke") == False

    def test_is_present_false(self, db: redis.Redis):
        """Check if method returns correctly"""
        assert auth.Blacklist(db).is_present("sometoken") == False
        assert auth.Blacklist(db).is_present("sometoke") == False

    def test_is_present_empty(self, db: redis.Redis):
        """Check if method returns correctly"""
        assert auth.Blacklist(db).is_present("") == False
