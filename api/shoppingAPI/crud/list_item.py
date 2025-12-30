from uuid import UUID

from shoppingAPI.app_types import ItemTypeRow
from shoppingAPI.database.db import ListItem, ShoppingList
from shoppingAPI.exceptions import ForbiddenAction, InvalidAction
from shoppingAPI.utils.utils import find_category
from shoppingAPI.validation_models import DeleteManyItems, NewListItem
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session


def new_list_item(
    session: Session, user_id: UUID, data: NewListItem, collection: list[ItemTypeRow]
) -> None:

    try:
        _ = (
            session.query(ShoppingList)
            .filter_by(id=data.list_id, user_id=user_id)
            .one()
        )
    except NoResultFound:
        raise ForbiddenAction(
            f"Cannot add new list item - list {data.list_id} does not exists or does not belong to user: {user_id}"
        )

    item = (
        session.query(ListItem)
        .filter_by(name=data.name, list_id=data.list_id)
        .one_or_none()
    )

    if item:
        item.quantity += data.quantity
    else:
        matching_item = find_category(data.name, collection=collection)
        item = ListItem(
            name=data.name,
            list_id=data.list_id,
            quantity=data.quantity,
            typeicon=(
                str(matching_item["icon"]) if matching_item is not None else "\u2753"
            ),
        )
        session.add(item)

    session.commit()


def delete_many_items(
    session: Session,
    user_id: UUID,
    data: DeleteManyItems,
) -> None:

    # 1. Sprawdzenie czy wszystkie item_ids należą do jednej listy
    rows = (
        session.query(ListItem.id, ListItem.list_id)
        .filter(ListItem.id.in_(data.items_ids))
        .all()
    )

    if len(rows) != len(set(data.items_ids)):
        found_ids = {row.id for row in rows}
        missing_ids = set(data.items_ids) - found_ids
        raise InvalidAction(f"Some item IDs do not exist: {missing_ids}")

    list_ids = {row.list_id for row in rows}
    if len(list_ids) != 1:
        raise InvalidAction("Items belong to different lists")

    list_id = list_ids.pop()

    # 2. Sprawdzenie czy lista istnieje i należy do usera
    exists = (
        session.query(ShoppingList.id)
        .filter_by(id=list_id, user_id=user_id)
        .one_or_none()
    )

    if not exists:
        raise ForbiddenAction(
            f"List {list_id} does not exist or does not belong to user {user_id}"
        )

    # 3. Usunięcie elementów
    (
        session.query(ListItem)
        .filter(ListItem.id.in_(data.items_ids))
        .delete(synchronize_session=False)
    )

    session.commit()
