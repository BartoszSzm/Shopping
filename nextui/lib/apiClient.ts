"server only";

export const URLS = {
  api: {
    apiUrl: () => process.env.BACKEND_URL,
    allLists: () => `${URLS.api.apiUrl()}/lists`,
    deleteList: () => `${URLS.api.apiUrl()}/deleteList`,
    newList: () => `${URLS.api.apiUrl()}/newList`,
    listDetails: (listId: number) => `${URLS.api.apiUrl()}/${listId}`,
    newListItem: () => `${URLS.api.apiUrl()}/newItem`,
    buyed: () => `${URLS.api.apiUrl()}/buyed`,
  },
  app: {
    lists: () => `/lists`,
    listDetails: (listId: number) => `${URLS.app.lists()}/${listId}/details`,
  },
};
