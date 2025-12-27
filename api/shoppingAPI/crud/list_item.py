from sqlalchemy.orm import Session

from shoppingAPI.app_types import ItemTypeRow
from shoppingAPI.database.db import ListItem
from shoppingAPI.utils.utils import find_category
from shoppingAPI.validation_models import NewListItem


def new_list_item(
    session: Session, data: NewListItem, collection: list[ItemTypeRow]
) -> None:
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
