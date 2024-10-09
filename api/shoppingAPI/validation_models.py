import typing as t
from datetime import datetime

from pydantic import BaseModel


class NewUser(BaseModel):
    username: str
    password: str


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
