"server only";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export const URLS = {
  api: {
    apiUrl: () => process.env.BACKEND_URL,
    allLists: () => `${URLS.api.apiUrl()}/lists`,
    sharedLists: () => `${URLS.api.apiUrl()}/lists/shared`,
    shareList: () => `${URLS.api.apiUrl()}/lists/share`,
    deleteList: () => `${URLS.api.apiUrl()}/deleteList`,
    newList: () => `${URLS.api.apiUrl()}/newList`,
    listDetails: (listId: number) => `${URLS.api.apiUrl()}/${listId}`,
    newListItem: () => `${URLS.api.apiUrl()}/newItem`,
    buyed: () => `${URLS.api.apiUrl()}/buyed`,
    updateItem: () => `${URLS.api.apiUrl()}/updateItem`,
    deleteItem: () => `${URLS.api.apiUrl()}/delete`,
    deleteManyItems: () => `${URLS.api.apiUrl()}/deleteManyItems`,
  },
  app: {
    lists: () => `/account/lists`,
    listDetails: (listId: number) => `${URLS.app.lists()}/${listId}/details`,
  },
};

type ApiFetchOptions<TBody> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: TBody;
  errorMessage?: string;
  token?: string;
  extraHeaders?: Record<string, string>;
};

export async function apiFetch<TResponse, TBody = unknown>({
  url,
  method = "GET",
  body,
  errorMessage = "Błąd komunikacji z API",
  token,
  extraHeaders = {},
}: ApiFetchOptions<TBody>): Promise<TResponse> {
  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-cache",
    });
  } catch (e) {
    throw new Error(`Network error: ${(e as Error).message}`);
  }

  const data = await res.json();

  if (!res.ok) {
    console.error("API error:", data);
    throw new Error(errorMessage);
  }

  return data as TResponse;
}

export async function authApiFetch<TResponse, TBody = unknown>({
  url,
  method = "GET",
  body,
  errorMessage = "Błąd komunikacji z API",
}: ApiFetchOptions<TBody>): Promise<TResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return apiFetch({
    url,
    method,
    body,
    errorMessage,
    token: process.env.BACKEND_SERVICE_TOKEN,
    extraHeaders: { "X-User-Id": session.shoppingUser.id },
  });
}
