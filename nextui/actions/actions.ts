"use server";

import { authApiFetch, URLS } from "@/lib/apiClient";

import {
  DeleteManyItems,
  ListIdentifier,
  ListItemIdentifier,
  ListItemType,
  MarkAsBuyedData,
  MsgResponse,
  NewList,
  NewListItem,
  ShoppingListResponse,
  UpdateItem,
} from "@/types/apiTypes";

export async function newList(payload: NewList): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, NewList>({
    url: URLS.api.newList(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można utworzyć listy",
  });
}

export async function deleteList(
  payload: ListIdentifier
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, ListIdentifier>({
    url: URLS.api.deleteList(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć listy",
  });
}

export async function getLists(): Promise<ListItemType[]> {
  return authApiFetch<ListItemType[]>({
    url: URLS.api.allLists(),
    errorMessage: "Nie można pobrać list",
  });
}

export async function getListDetails(
  listId: number
): Promise<ShoppingListResponse> {
  return authApiFetch<ShoppingListResponse>({
    url: URLS.api.listDetails(listId),
    errorMessage: "Nie można pobrać szczegółów listy",
  });
}

export async function newListItem(payload: NewListItem): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, NewListItem>({
    url: URLS.api.newListItem(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można dodać nowego elementu",
  });
}

export async function toggleBuyed(
  payload: MarkAsBuyedData
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, MarkAsBuyedData>({
    url: URLS.api.buyed(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można zaktualizować stanu",
  });
}

export async function editItem(payload: UpdateItem): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, UpdateItem>({
    url: URLS.api.updateItem(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można zaktualizować elementu",
  });
}

export async function deleteItem(
  payload: ListItemIdentifier
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, ListItemIdentifier>({
    url: URLS.api.deleteItem(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć elementu",
  });
}

export async function deleteAllItems(
  payload: DeleteManyItems
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, DeleteManyItems>({
    url: URLS.api.deleteManyItems(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć elementów",
  });
}
