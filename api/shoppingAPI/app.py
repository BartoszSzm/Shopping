import typing as t
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from .database import ItemTypes, ListItem, ShoppingList, db_session
from .database.db import create_db, create_dummy_list


class DeleteManyItems(BaseModel):
    items_ids: t.List[int]


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


class MarkAsBuyedData(ListItemIdentifier):
    buyed: bool


class NewListItem(BaseModel):
    name: str
    quantity: int
    list_id: int


class MsgResponse(BaseModel):
    status: t.Literal["confirmed", "rejected"]
    msg: t.Optional[str] = ""


class NewList(BaseModel):
    name: str


class ShoppingListModel(BaseModel):
    id: int
    name: str
    created: datetime
    modified: datetime


class UpdateItem(BaseModel):
    id: int
    name: t.Optional[str] = None
    quantity: t.Optional[int] = None


class AllListsResponse(BaseModel):
    lists: t.List[ShoppingListModel]


class ListIdentifier(BaseModel):
    id: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    create_dummy_list()
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


@app.get("/api/lists")
def get_lists() -> t.List[ShoppingListModel] | MsgResponse:
    with db_session() as session:
        response: t.List[ShoppingListModel] = []
        try:
            all_lists = session.query(ShoppingList).all()
            for list in all_lists:
                response.append(
                    ShoppingListModel(
                        id=list.id,
                        name=list.name,
                        created=list.created,
                        modified=list.modified,
                    )
                )
            return response
        except Exception as exc:
            return MsgResponse(status="rejected", msg=str(exc))


@app.get("/api/{list_id}")
def get_list_items(list_id: int) -> ShoppingListResponse | MsgResponse:
    with db_session() as session:
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
def buyed(data: MarkAsBuyedData) -> MsgResponse:
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
            return MsgResponse(status="rejected", msg="Item not found")
        else:
            return MsgResponse(status="confirmed")


@app.post("/api/delete")
def delete(data: ListItemIdentifier) -> MsgResponse:
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
            return MsgResponse(status="rejected", msg="Record not found")
        else:
            return MsgResponse(status="confirmed")


@app.post("/api/newItem")
def newItem(data: NewListItem) -> MsgResponse:
    with db_session() as session:
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
                typeicon=ItemTypes().get_typeicon(data.name),
            )
            session.add(item)
            session.commit()
            return MsgResponse(status="confirmed")


@app.post("/api/newList")
def new_list(data: NewList) -> MsgResponse:
    with db_session() as session:
        try:
            new_list = ShoppingList(name=data.name)
            session.add(new_list)
            session.commit()
            return MsgResponse(status="confirmed")
        except Exception as exc:
            return MsgResponse(status="rejected", msg=str(exc))


@app.post("/api/deleteList")
def delete_list(data: ListIdentifier) -> MsgResponse:
    with db_session() as session:
        try:
            list: ShoppingList = session.query(ShoppingList).filter_by(id=data.id).one()
            session.delete(list)
            session.commit()
        except NoResultFound:
            return MsgResponse(status="rejected", msg="Record not found")
        else:
            return MsgResponse(status="confirmed")


@app.post("/api/updateItem")
def update_item(data: UpdateItem) -> MsgResponse:
    with db_session() as session:
        try:
            item: ListItem = session.query(ListItem).filter_by(id=data.id).one()
            if data.name:
                item.name = data.name
            if data.quantity:
                item.quantity = data.quantity
            session.commit()
            return MsgResponse(status="confirmed")

        except NoResultFound:
            return MsgResponse(
                status="rejected", msg=f"No item found with id: {data.id}"
            )
        except MultipleResultsFound:
            return MsgResponse(
                status="rejected", msg=f"Multiple items found for id: {data.id}"
            )


@app.post("/api/deleteManyItems")
def delete_many_items(data: DeleteManyItems) -> MsgResponse:
    with db_session() as session:
        try:
            items: t.List[ListItem] = (
                session.query(ListItem).filter(ListItem.id.in_(data.items_ids)).all()
            )
            if len(items) == len(data.items_ids):
                [session.delete(item) for item in items]  # type: ignore
                session.commit()
                return MsgResponse(status="confirmed")
            else:
                return MsgResponse(
                    status="rejected",
                    msg="Given ids list does not match these in database",
                )
        except Exception as exc:
            print(exc)
            return MsgResponse(status="rejected", msg="Database error")
