"use server";

import { URLS } from "@/lib/apiClient";
import { ListIdentifier, MsgResponse, NewList } from "@/types/apiTypes";

export async function newList(listItem: NewList): Promise<MsgResponse> {
  let res: Response;

  try {
    res = await fetch(URLS.newList(), {
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
    res = await fetch(URLS.deleteList(), {
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
