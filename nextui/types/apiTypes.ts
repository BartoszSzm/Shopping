import { components } from "./api";

export type ShareListInput = {
  email: string;
  listId: number;
  role: SetableRoles;
};

export type DeleteManyItems = components["schemas"]["DeleteManyItems"];
export type SetableRoles = Exclude<components["schemas"]["ListRole"], "owner">;
export type HTTPValidationError = components["schemas"]["HTTPValidationError"];
export type ListIdentifier = components["schemas"]["ListIdentifier"];
export type ListItemIdentifier = components["schemas"]["ListItemIdentifier"];
export type ListItemType = components["schemas"]["ListItemType"];
export type ShareListRequest = components["schemas"]["ShareListRequest"];
export type MarkAsBuyedData = components["schemas"]["MarkAsBuyedData"];
export type MsgResponse = components["schemas"]["MsgResponse"];
export type NewList = components["schemas"]["NewList"];
export type NewListItem = components["schemas"]["NewListItem"];
export type ShoppingListModel = components["schemas"]["ShoppingListModel"];
export type ShoppingListResponse =
  components["schemas"]["ShoppingListResponse"];
export type UpdateItem = components["schemas"]["UpdateItem"];
export type ValidationError = components["schemas"]["ValidationError"];
