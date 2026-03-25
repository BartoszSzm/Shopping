"use server";

import { authApiFetch, URLS } from "@/lib/apiClient";
import { getAllowedUser } from "@/lib/utils";

import {
  DeleteManyItems,
  ListIdentifier,
  ListItemIdentifier,
  MarkAsBuyedData,
  MsgResponse,
  NewList,
  NewListItem,
  Notification,
  ShareListInput,
  ShoppingListModel,
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
  payload: ListIdentifier,
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, ListIdentifier>({
    url: URLS.api.deleteList(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć listy",
  });
}

export async function getLists(): Promise<ShoppingListModel[]> {
  return authApiFetch<ShoppingListModel[]>({
    url: URLS.api.allLists(),
    errorMessage: "Nie można pobrać list",
  });
}

export async function getSharedLists(): Promise<ShoppingListModel[]> {
  return authApiFetch<ShoppingListModel[]>({
    url: URLS.api.sharedLists(),
    errorMessage: "Nie można pobrać list",
  });
}

export async function shareList(
  shareListInput: ShareListInput,
): Promise<MsgResponse> {
  const user = await getAllowedUser(shareListInput.email);
  if (!user) {
    throw new Error("Niepoprawny email lub użytkownik nie istnieje");
  }
  return authApiFetch<MsgResponse>({
    method: "POST",
    body: {
      shopping_list_id: shareListInput.listId,
      user_id: user.id,
      role: shareListInput.role,
    },
    url: URLS.api.shareList(),
    errorMessage: "Nie można pobrać list",
  });
}

export async function getListDetails(
  listId: number,
): Promise<ShoppingListResponse | MsgResponse> {
  return authApiFetch<ShoppingListResponse | MsgResponse>({
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
  payload: MarkAsBuyedData,
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
  payload: ListItemIdentifier,
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, ListItemIdentifier>({
    url: URLS.api.deleteItem(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć elementu",
  });
}

export async function deleteAllItems(
  payload: DeleteManyItems,
): Promise<MsgResponse> {
  return authApiFetch<MsgResponse, DeleteManyItems>({
    url: URLS.api.deleteManyItems(),
    method: "POST",
    body: payload,
    errorMessage: "Nie można usunąć elementów",
  });
}

export async function clearNotifications(): Promise<null> {
  return authApiFetch<null, null>({
    url: URLS.api.clearNotifications(),
    method: "DELETE",
    errorMessage: "Nie można usunąć powiadomień",
  });
}

export async function getAllNotifications(): Promise<Notification[]> {
  return authApiFetch<Notification[], null>({
    url: URLS.api.getAllNotifications(),
    method: "GET",
    errorMessage: "Nie można usunąć powiadomień",
  });
}

export async function markNotificationsAsSeen(): Promise<null> {
  return authApiFetch<null, null>({
    url: URLS.api.markNotificationsAsSeen(),
    method: "PATCH",
    errorMessage: "Nie można usunąć powiadomień",
  });
}
