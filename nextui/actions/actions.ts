"use server";

import { URLS } from "@/lib/apiClient";
import {
  ListIdentifier,
  ListItemType,
  MsgResponse,
  NewList,
  NewListItem,
  ShoppingListResponse,
} from "@/types/apiTypes";

export async function newList(listItem: NewList): Promise<MsgResponse> {
  let res: Response;

  try {
    res = await fetch(URLS.api.newList(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listItem),
      cache: "no-cache",
    });
  } catch (e) {
    const err = e as Error;
    throw new Error(`Network error ${err}`);
  }

  return await res.json();
}

export async function deleteList(
  listItem: ListIdentifier
): Promise<MsgResponse> {
  let res: Response;
  try {
    res = await fetch(URLS.api.deleteList(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listItem),
      cache: "no-cache",
    });
  } catch (e) {
    const err = e as Error;
    throw new Error(`Network error ${err}`);
  }

  return await res.json();
}

export async function getLists(): Promise<ListItemType[]> {
  const res = await fetch(URLS.api.allLists(), { cache: "no-cache" });

  if (!res.ok) {
    throw new Error("Nie można pobrać list");
  }

  return res.json();
}

export async function getListDetails(
  listId: number
): Promise<ShoppingListResponse> {
  const res = await fetch(URLS.api.listDetails(listId), { cache: "no-cache" });

  if (!res.ok) {
    throw new Error("Nie można pobrać szczegółów listy");
  }

  return res.json();
}

export async function newListItem(listItem: NewListItem): Promise<MsgResponse> {
  let res: Response;
  try {
    res = await fetch(URLS.api.newListItem(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listItem),
      cache: "no-cache",
    });
  } catch (e) {
    const err = e as Error;
    throw new Error(`Network error ${err}`);
  }

  if (!res.ok) {
    throw new Error("Nie można dodać nowego elementu");
  }

  return await res.json();
}
