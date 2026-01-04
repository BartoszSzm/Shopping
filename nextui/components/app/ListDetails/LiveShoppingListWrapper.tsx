"use client"; // To jest kluczowe - oznacza komponent kliencki

import { getListDetails } from "@/actions/actions"; // Upewnij się, że to Server Action
import ShoppingListTable from "@/components/app/ListDetails/ShoppingListTable";
import { sortTableRows } from "@/lib/utils";
import { ShoppingListResponse } from "@/types/apiTypes";
import { useEffect, useState } from "react";

type Props = {
  initialData: ShoppingListResponse;
  listId: number;
  headers: string[];
};

const LiveShoppingListWrapper = ({ initialData, listId, headers }: Props) => {
  const [data, setData] = useState<ShoppingListResponse>(initialData);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        // Wywołanie Server Action po stronie klienta
        const freshData = await getListDetails(listId);
        setData(freshData);
      } catch (error) {
        console.error("Błąd podczas odświeżania listy:", error);
      }
    }, 2000); // 5000 ms = 5 sekund

    // Sprzątanie interwału przy odmontowaniu komponentu
    return () => clearInterval(intervalId);
  }, [listId]);

  // Sortowanie odbywa się teraz tutaj, przy każdym renderze z nowymi danymi
  const rows = sortTableRows(data.list_items);

  return <ShoppingListTable headers={headers} rows={rows} />;
};

export default LiveShoppingListWrapper;
