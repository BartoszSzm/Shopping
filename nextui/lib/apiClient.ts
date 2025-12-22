"server only";

export const URLS = {
  apiUrl: () => process.env.BACKEND_URL,
  allLists: () => `${URLS.apiUrl()}/lists`,
  deleteList: () => `${URLS.apiUrl()}/deleteList`,
  newList: () => `${URLS.apiUrl()}/newList`,
};
