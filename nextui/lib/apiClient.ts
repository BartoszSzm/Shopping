"server only";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export const URLS = {
  api: {
    apiUrl: () => process.env.BACKEND_URL,
    allLists: () => `${URLS.api.apiUrl()}/lists`,
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
};

export async function apiFetch<TResponse, TBody = unknown>({
  url,
  method = "GET",
  body,
  errorMessage = "Błąd komunikacji z API",
  token,
}: ApiFetchOptions<TBody>): Promise<TResponse> {
  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
  if (!session || !session.accessToken) {
    throw new Error("Unauthorized");
  }
  return apiFetch({
    url,
    method,
    body,
    errorMessage,
    token: session.accessToken,
  });
}
