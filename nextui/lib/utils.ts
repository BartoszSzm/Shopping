import { ListItemType } from "@/types/apiTypes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sortTableRows = (rows: ListItemType[]) => {
  return [...rows].sort((a, b) => {
    if (a.buyed !== b.buyed) {
      return a.buyed ? 1 : -1;
    }
    if (a.typeicon < b.typeicon) return -1;
    if (a.typeicon > b.typeicon) return 1;
    return 0;
  });
};
