import typing as t
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shoppingAPI import validation_models as basic_vm
from shoppingAPI.app_types import ItemTypeRow
from shoppingAPI.auth.auth import TokenData, get_token_data
from shoppingAPI.crud import list_item as list_item_crud
from shoppingAPI.exceptions import ForbiddenAction, InvalidAction
from shoppingAPI.utils.load_categories import load_item_types
from sqlalchemy.exc import MultipleResultsFound, NoResultFound

from .database import ListItem, ShoppingList, db_session
from .database.db import create_db

item_types: t.Optional[list[ItemTypeRow]] = None


def get_item_types() -> list[ItemTypeRow]:
    global item_types
    if item_types:
        return item_types
    raise ValueError("cannot get item_types")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # before
    create_db()
    global item_types
    item_types = load_item_types()
    yield
    # after


app = FastAPI(lifespan=lifespan, docs_url="/api/docs")


origins = ["http://localhost:5173", "http://localhost"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


############################ AUTH ENDPOINTS ######################################
@app.get("/token-data/", response_model=TokenData)
async def read_token_data(
    token_data: t.Annotated[TokenData, Depends(get_token_data)],
):
    return token_data


########################## UTILITY ENDPOINTS ###################################


@app.get("/api/lists")
def get_lists(
    token: t.Annotated[TokenData, Depends(get_token_data)],
) -> t.List[basic_vm.ShoppingListModel] | basic_vm.MsgResponse:
    with db_session() as session:
        response: t.List[basic_vm.ShoppingListModel] = []
        try:
            all_lists = (
                session.query(ShoppingList).filter_by(user_id=token.user_id).all()
            )
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
    list_id: int, token: t.Annotated[TokenData, Depends(get_token_data)]
) -> basic_vm.ShoppingListResponse | basic_vm.MsgResponse:
    with db_session() as session:
        try:
            items = (
                session.query(ShoppingList)
                .filter_by(id=list_id, user_id=token.user_id)
                .one()
            )
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
    token: t.Annotated[TokenData, Depends(get_token_data)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            _ = (
                session.query(ShoppingList)
                .filter_by(id=data.list_id, user_id=token.user_id)
                .one()
            )
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
    token: t.Annotated[TokenData, Depends(get_token_data)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            _ = (
                session.query(ShoppingList)
                .filter_by(id=data.list_id, user_id=token.user_id)
                .one()
            )
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
    data: basic_vm.NewListItem, token: t.Annotated[TokenData, Depends(get_token_data)]
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            list_item_crud.new_list_item(
                session, token.user_id, data, collection=get_item_types()
            )
            return basic_vm.MsgResponse(status="confirmed")
        except ForbiddenAction as exc:
            print(str(exc))
            return basic_vm.MsgResponse(
                status="rejected", msg="Error occured, check logs"
            )
        except Exception as exc:
            print(str(exc))
            return basic_vm.MsgResponse(
                status="rejected", msg="Error occured, check logs"
            )


@app.post("/api/newList")
def new_list(
    data: basic_vm.NewList, token: t.Annotated[TokenData, Depends(get_token_data)]
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            new_list = ShoppingList(name=data.name, user_id=token.user_id)
            session.add(new_list)
            session.commit()
            return basic_vm.MsgResponse(status="confirmed")
        except Exception as exc:
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.post("/api/deleteList")
def delete_list(
    data: basic_vm.ListIdentifier,
    token: t.Annotated[TokenData, Depends(get_token_data)],
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
    data: basic_vm.UpdateItem, token: t.Annotated[TokenData, Depends(get_token_data)]
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .filter_by(id=data.id, user_id=token.user_id)
                .one()
            )
            if data.name:
                item.name = data.name
            if data.quantity:
                item.quantity = data.quantity
            session.commit()
            return basic_vm.MsgResponse(status="confirmed")

        except NoResultFound:
            return basic_vm.MsgResponse(
                status="rejected", msg=f"No item found with id: {data.id} for this user"
            )
        except MultipleResultsFound:
            return basic_vm.MsgResponse(
                status="rejected",
                msg=f"Multiple items found for id: {data.id} for this user",
            )


@app.post("/api/deleteManyItems")
def delete_many_items(
    data: basic_vm.DeleteManyItems,
    token: t.Annotated[TokenData, Depends(get_token_data)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            list_item_crud.delete_many_items(session, user_id=token.user_id, data=data)
            return basic_vm.MsgResponse(status="confirmed")

        except (InvalidAction, ForbiddenAction) as exc:
            print(exc)
            return basic_vm.MsgResponse(
                status="rejected", msg="Some error occured, check logs"
            )

        except Exception as exc:
            print(exc)
            return basic_vm.MsgResponse(
                status="rejected", msg="Unknown error, check logs"
            )
