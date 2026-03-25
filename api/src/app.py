import typing as t
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import and_, or_
from sqlalchemy.exc import MultipleResultsFound, NoResultFound
from sqlalchemy.orm import Session, joinedload, sessionmaker

from src import validation_models as basic_vm
from src.app_types import ItemTypeRow
from src.auth.auth import TokenData, get_token_data
from src.config import get_config
from src.crud import list_item as list_item_crud
from src.crud import notifications as notif_crud
from src.exceptions import ForbiddenAction
from src.utils.load_categories import load_item_types

from .database import ListItem, ShoppingList
from .database.db import (
    ListRole,
    Notification,
    ShoppingListShare,
    create_db,
    get_db_session,
)


@lru_cache(maxsize=1)
def get_cached_item_types() -> list[ItemTypeRow]:
    return load_item_types()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db(get_config().DB_URL)
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
@app.get("/token-data/")
async def read_token_data(
    token_data: t.Annotated[TokenData, Depends(get_token_data)],
):
    return token_data


########################## UTILITY ENDPOINTS ###################################


@app.get("/api/lists")
def get_lists(
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> t.List[basic_vm.ShoppingListModel] | basic_vm.MsgResponse:
    with db_session() as session:
        response: t.List[basic_vm.ShoppingListModel] = []
        try:
            all_lists = (
                session.query(ShoppingList)
                .options(joinedload(ShoppingList.shared_with))
                .filter_by(user_id=token.user_id, role=ListRole.OWNER.value)
                .all()
            )

            for list in all_lists:
                response.append(
                    basic_vm.ShoppingListModel(
                        id=list.id,
                        name=list.name,
                        created=list.created,
                        modified=list.modified,
                        owner=list.user_id,
                        shared_with=[share.user_id for share in list.shared_with],
                    )
                )
            return response
        except Exception as exc:
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.get("/api/lists/shared")
def get_shared_lists(
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> t.List[basic_vm.ShoppingListModel] | basic_vm.MsgResponse:
    with db_session() as session:
        response: t.List[basic_vm.ShoppingListModel] = []
        try:
            shared_lists = (
                session.query(ShoppingList)
                .join(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .filter(ShoppingListShare.user_id == token.user_id)
                .all()
            )

            for slist in shared_lists:
                response.append(
                    basic_vm.ShoppingListModel(
                        id=slist.id,
                        name=slist.name,
                        created=slist.created,
                        modified=slist.modified,
                        owner=slist.user_id,
                    )
                )

            return response
        except Exception as exc:
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.post("/api/lists/share")
def share_list(
    request: basic_vm.ShareListRequest,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            shopping_list = (
                session.query(ShoppingList)
                .filter_by(id=request.shopping_list_id, user_id=token.user_id)
                .first()
            )
            if not shopping_list:
                return basic_vm.MsgResponse(
                    status="rejected", msg="List not found or you are not the owner"
                )

            existing_share = (
                session.query(ShoppingListShare)
                .filter_by(
                    shopping_list_id=request.shopping_list_id, user_id=request.user_id
                )
                .first()
            )
            if existing_share:
                return basic_vm.MsgResponse(
                    status="rejected",
                    msg="List already shared with this user",
                )

            new_share = ShoppingListShare(
                shopping_list_id=request.shopping_list_id,
                user_id=request.user_id,
                role=request.role.value,
            )
            session.add(new_share)
            session.commit()

            return basic_vm.MsgResponse(
                status="confirmed",
                msg=f"List shared successfully with user {request.user_id}",
            )

        except Exception as exc:
            session.rollback()
            return basic_vm.MsgResponse(status="rejected", msg=str(exc))


@app.get("/api/{list_id}")
def get_list_items(
    list_id: int,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.ShoppingListResponse | basic_vm.MsgResponse:

    with db_session() as session:
        try:
            requested_list = (
                session.query(ShoppingList)
                .outerjoin(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .options(joinedload(ShoppingList.items))
                .filter(
                    ShoppingList.id == list_id,
                    or_(
                        ShoppingList.user_id == token.user_id,
                        ShoppingListShare.user_id == token.user_id,
                    ),
                )
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
                    for item in requested_list.items
                ],
            )


@app.post("/api/buyed")
def buyed(
    data: basic_vm.MarkAsBuyedData,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            _ = (
                session.query(ShoppingList)
                .outerjoin(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .options(joinedload(ShoppingList.items))
                .filter(
                    ShoppingList.id == data.list_id,
                    or_(
                        ShoppingList.user_id == token.user_id,
                        ShoppingListShare.user_id == token.user_id,
                    ),
                )
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
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            _ = (
                session.query(ShoppingList)
                .outerjoin(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .options(joinedload(ShoppingList.items))
                .filter(
                    ShoppingList.id == data.list_id,
                    or_(
                        ShoppingList.user_id == token.user_id,
                        and_(
                            ShoppingListShare.user_id == token.user_id,
                            ShoppingListShare.role == ListRole.EDITOR.value,
                        ),
                    ),
                )
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
            return basic_vm.MsgResponse(
                status="rejected", msg="Record not found or insufficient permissions"
            )
        else:
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/newItem")
def newItem(
    data: basic_vm.NewListItem,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
    items_collection: t.Annotated[list[ItemTypeRow], Depends(get_cached_item_types)],
) -> basic_vm.MsgResponse:
    with db_session() as session:
        try:
            list_item_crud.new_list_item(
                session, token.user_id, data, collection=items_collection
            )
            notif_crud.notify(
                session,
                data.list_id,
                token.user_id,
                message=f"Użytkownik {token.user_id} dodał element {data.name} do listy {data.list_id}",
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
    data: basic_vm.NewList,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
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
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:

    with db_session() as session:
        try:
            shopping_list = (
                session.query(ShoppingList)
                .filter(
                    ShoppingList.id == data.id,
                    ShoppingList.user_id == token.user_id,
                )
                .one()
            )

            session.delete(shopping_list)
            session.commit()

        except NoResultFound:
            return basic_vm.MsgResponse(
                status="rejected",
                msg="Record not found or insufficient permissions",
            )

        else:
            return basic_vm.MsgResponse(status="confirmed")


@app.post("/api/updateItem")
def update_item(
    data: basic_vm.UpdateItem,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:

    with db_session() as session:
        try:
            item: ListItem = (
                session.query(ListItem)
                .join(ShoppingList, ListItem.list_id == ShoppingList.id)
                .outerjoin(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .filter(
                    ListItem.id == data.id,
                    or_(
                        ShoppingList.user_id == token.user_id,
                        and_(
                            ShoppingListShare.user_id == token.user_id,
                            ShoppingListShare.role == ListRole.EDITOR.value,
                        ),
                    ),
                )
                .one()
            )

            if data.name is not None:
                item.name = data.name

            if data.quantity is not None:
                item.quantity = data.quantity

            session.commit()

            return basic_vm.MsgResponse(status="confirmed")

        except NoResultFound:
            return basic_vm.MsgResponse(
                status="rejected",
                msg="Item not found or insufficient permissions",
            )

        except MultipleResultsFound:
            return basic_vm.MsgResponse(
                status="rejected",
                msg=f"Multiple items found for id: {data.id}",
            )


@app.post("/api/deleteManyItems")
def delete_many_items(
    data: basic_vm.DeleteManyItems,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
) -> basic_vm.MsgResponse:

    with db_session() as session:
        try:
            items = (
                session.query(ListItem)
                .join(ShoppingList, ListItem.list_id == ShoppingList.id)
                .outerjoin(
                    ShoppingListShare,
                    ShoppingList.id == ShoppingListShare.shopping_list_id,
                )
                .filter(
                    ListItem.id.in_(data.items_ids),
                    or_(
                        ShoppingList.user_id == token.user_id,
                        and_(
                            ShoppingListShare.user_id == token.user_id,
                            ShoppingListShare.role == ListRole.EDITOR.value,
                        ),
                    ),
                )
                .all()
            )

            if len(items) != len(data.items_ids):
                return basic_vm.MsgResponse(
                    status="rejected",
                    msg="Item not found or insufficient permissions",
                )

            for item in items:
                session.delete(item)

            session.commit()

            return basic_vm.MsgResponse(status="confirmed")

        except Exception as exc:
            print(exc)
            return basic_vm.MsgResponse(
                status="rejected", msg="Unknown error, check logs"
            )


@app.patch("/api/notifications/seen")
def notification_seen(
    data: basic_vm.NotificationSeenRequest,
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
):
    with db_session() as session:
        notification = (
            session.query(Notification)
            .filter_by(id=data.id, user_id=token.user_id)
            .first()
        )
        if notification is None:
            raise HTTPException(404, "Notification not found for this user")

        notification.is_read = True
        session.commit()


@app.get("/api/notifications/all")
def notification_all(
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
):
    with db_session() as session:
        return session.query(Notification).filter_by(user_id=token.user_id).all()


@app.delete("/api/notifications/clear")
def notification_clear(
    token: t.Annotated[TokenData, Depends(get_token_data)],
    db_session: t.Annotated[sessionmaker[Session], Depends(get_db_session)],
):
    with db_session() as session:
        session.query(Notification).filter_by(user_id=token.user_id).delete()
        session.commit()
