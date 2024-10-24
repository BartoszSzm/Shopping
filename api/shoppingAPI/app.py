import os
import time
import typing as t
from contextlib import asynccontextmanager
from datetime import timedelta
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_csrf_protect import CsrfProtect
from fastapi_csrf_protect.exceptions import CsrfProtectError
from pydantic import BaseModel
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from shoppingAPI import validation_models as basic_vm

from .auth import auth
from .auth import validation_models as auth_vm
from .database import ItemTypes, ListItem, ShoppingList, Users, db_session
from .database.db import create_db, create_dummy_list


class Config(BaseModel):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    CSRF_SECRET_KEY: str
    TOKEN_MAX_AGE_MILISECONDS: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    # before
    create_db()
    create_dummy_list()
    yield
    # after


app = FastAPI(lifespan=lifespan)


config = Config(
    SECRET_KEY=os.environ["SECRET_KEY"],
    ALGORITHM=os.environ["ALGORITHM"],
    ACCESS_TOKEN_EXPIRE_MINUTES=int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"]),
    CSRF_SECRET_KEY=os.environ["CSRF_SECRET_KEY"],
    TOKEN_MAX_AGE_MILISECONDS=int(os.environ["TOKEN_MAX_AGE_MILISECONDS"]),
)


class CsrfSettings(BaseModel):
    secret_key: str = config.CSRF_SECRET_KEY


@CsrfProtect.load_config  # type: ignore
def get_csrf_config():
    return CsrfSettings()


origins = ["http://localhost:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


############################ ATUH ENDPOINTS ####################################


@app.exception_handler(CsrfProtectError)
def csrf_protect_exception_handler(
    request: Request, exc: CsrfProtectError
) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.post("/api/token")
async def login_for_access_token(
    response: Response,
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    csrf_protect: CsrfProtect = Depends(),
) -> auth_vm.Token:

    await csrf_protect.validate_csrf(request)
    csrf_protect.unset_csrf_cookie(response)

    user = Users.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
        secret_key=config.SECRET_KEY,
        algorithm=config.ALGORITHM,
    )
    response.set_cookie(
        key="Authorization",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=config.TOKEN_MAX_AGE_MILISECONDS or None,
    )

    return auth_vm.Token(access_token=access_token, token_type="bearer")


@app.get("/api/csrf-token")
def get_csrf_token(csrf_protect: CsrfProtect = Depends()):
    """Returns the CSRF token for the client."""
    csrf_token, signed_token = csrf_protect.generate_csrf_tokens()
    response = JSONResponse({"csrf_token": csrf_token})
    csrf_protect.set_csrf_cookie(signed_token, response)
    return response


@app.post("/api/logout")
async def logout(
    token_data: t.Annotated[auth_vm.TokenData, Depends(auth.get_token_data)],
    response: Response,
):
    auth.revoke_token(token_data.token, token_data.expiration - int(time.time()))
    response.delete_cookie(key="Authorization", httponly=True)
    return basic_vm.MsgResponse(status="confirmed", msg="Logged out")


@app.get("/users/me/")
async def read_users_me(
    current_user: Annotated[Users, Depends(auth.get_current_active_user)],
):
    return current_user


########################## UTILITY ENDPOINTS ###################################


@app.get("/api/lists")
def get_lists(
    user: t.Annotated[Users, Depends(auth.get_current_active_user)]
) -> t.List[basic_vm.ShoppingListModel] | basic_vm.MsgResponse:
    with db_session() as session:
        response: t.List[basic_vm.ShoppingListModel] = []
        try:
            all_lists = session.query(ShoppingList).all()
            for list in all_lists:
                response.append(
                    basic_vm.ShoppingListModel(
                        id=list.id,
                        name=list.name,
                        created=list.created,
                        modified=list.modified,
                    )
                )
            return response
        except Exception as exc:
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.get("/api/{list_id}")
def get_list_items(
    list_id: int, user: t.Annotated[Users, Depends(auth.get_current_active_user)]
) -> basic_vm.ShoppingListResponse | basic_vm.MsgResponse:
    with db_session() as session:
        try:
            items = session.query(ShoppingList).filter_by(id=list_id).one()
        except NoResultFound:
            return basic_vm.MsgResponse(status="rejected", msg="Item not found")
        else:
            return basic_vm.ShoppingListResponse(
                list_id=list_id,
                list_items=[
                    basic_vm.ListItemType(
                        id=item.id,
                        name=item.name,
                        list_id=item.list_id,
                        quantity=item.quantity,
                        buyed=item.buyed,
                        typeicon=item.typeicon,
                        created=item.created,
                        modified=item.modified,
                    )
                    for item in items.items
                ],
            )


@app.post("/api/buyed")
def buyed(
    data: basic_vm.MarkAsBuyedData,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .filter_by(id=data.item_id, list_id=data.list_id)
                .one()
            )
            item.buyed = data.buyed
            session.commit()
        except NoResultFound:
            return basic_vm.MsgResponse(status="rejected", msg="Item not found")
        else:
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/delete")
def delete(
    data: basic_vm.ListItemIdentifier,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .filter_by(id=data.item_id, list_id=data.list_id)
                .one()
            )
            session.delete(item)
            session.commit()
        except NoResultFound:
            return basic_vm.MsgResponse(status="rejected", msg="Record not found")
        else:
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/newItem")
def newItem(
    data: basic_vm.NewListItem,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            session.query(ListItem).filter_by(
                name=data.name, list_id=data.list_id
            ).one()
            return basic_vm.MsgResponse(status="rejected", msg="Already on the list")
        except NoResultFound:
            item: ListItem = ListItem(
                name=data.name,
                list_id=data.list_id,
                quantity=data.quantity,
                typeicon=ItemTypes().get_typeicon(data.name),
            )
            session.add(item)
            session.commit()
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/newList")
def new_list(
    data: basic_vm.NewList,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            new_list = ShoppingList(name=data.name)
            session.add(new_list)
            session.commit()
            return basic_vm.MsgResponse(status="confirmed")
        except Exception as exc:
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.post("/api/deleteList")
def delete_list(
    data: basic_vm.ListIdentifier,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            list: ShoppingList = session.query(ShoppingList).filter_by(id=data.id).one()
            session.delete(list)
            session.commit()
        except NoResultFound:
            return basic_vm.MsgResponse(status="rejected", msg="Record not found")
        else:
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/updateItem")
def update_item(
    data: basic_vm.UpdateItem,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            item: ListItem = session.query(ListItem).filter_by(id=data.id).one()
            if data.name:
                item.name = data.name
            if data.quantity:
                item.quantity = data.quantity
            session.commit()
            return basic_vm.MsgResponse(status="confirmed")

        except NoResultFound:
            return basic_vm.MsgResponse(
                status="rejected", msg=f"No item found with id: {data.id}"
            )
        except MultipleResultsFound:
            return basic_vm.MsgResponse(
                status="rejected", msg=f"Multiple items found for id: {data.id}"
            )


@app.post("/api/deleteManyItems")
def delete_many_items(
    data: basic_vm.DeleteManyItems,
    user: t.Annotated[Users, Depends(auth.get_current_active_user)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            items: t.List[ListItem] = (
                session.query(ListItem).filter(ListItem.id.in_(data.items_ids)).all()
            )
            if len(items) == len(data.items_ids):
                [session.delete(item) for item in items]  # type: ignore
                session.commit()
                return basic_vm.MsgResponse(status="confirmed")
            else:
                return basic_vm.MsgResponse(
                    status="rejected",
                    msg="Given ids list does not match these in database",
                )
        except Exception as exc:
            print(exc)
            return basic_vm.MsgResponse(status="rejected", msg="Database error")
