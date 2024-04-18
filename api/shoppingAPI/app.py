import typing as t
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.exc import NoResultFound

from .database import ItemType, ListItem, ShoppingList, db_session
from .database.db import create_db


class ListItemType(BaseModel):
    id: int
    name: str
    list_id: int
    quantity: int
    buyed: bool
    typeicon: str
    created: datetime
    modified: datetime


class ShoppingListResponse(BaseModel):
    list_id: int
    list_items: t.List[ListItemType]


class ListItemIdentifier(BaseModel):
    item_id: int
    list_id: int


class NewListItem(BaseModel):
    name: str
    quantity: int
    list_id: int


class MsgResponse(BaseModel):
    status: t.Literal["confirmed", "rejected"]
    msg: t.Optional[str] = ""


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield
    # after


app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/{list_id}")
def get_list_items(list_id: int) -> ShoppingListResponse | MsgResponse:
    with db_session as session:
        try:
            items = session.query(ShoppingList).filter_by(id=list_id).one()
        except NoResultFound:
            return MsgResponse(status="rejected", msg="Item not found")
        else:
            return ShoppingListResponse(
                list_id=list_id,
                list_items=[
                    ListItemType(
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
def buyed(data: ListItemIdentifier) -> MsgResponse:
    with db_session as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .filter_by(id=data.item_id, list_id=data.list_id)
                .one()
            )
            item.buyed = not item.buyed
            session.commit()
        except NoResultFound:
            return MsgResponse(status="rejected", msg="Item not found")
        else:
            return MsgResponse(status="confirmed")


@app.post("/api/delete")
def delete(data: ListItemIdentifier) -> MsgResponse:
    with db_session as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .filter_by(id=data.item_id, list_id=data.list_id)
                .one()
            )
            session.delete(item)
            session.commit()
        except NoResultFound:
            return MsgResponse(status="rejected", msg="Record not found")
        else:
            return MsgResponse(status="confirmed")


@app.post("/api/new")
def new(data: NewListItem) -> MsgResponse:
    with db_session as session:
        try:
            session.query(ListItem).filter_by(
                name=data.name, list_id=data.list_id
            ).one()
            return MsgResponse(status="rejected", msg="Already on the list")
        except NoResultFound:
            item: ListItem = ListItem(
                name=data.name,
                list_id=data.list_id,
                quantity=data.quantity,
                typeicon=ItemType.fruit,
            )
            session.add(item)
            session.commit()
            return MsgResponse(status="confirmed")
