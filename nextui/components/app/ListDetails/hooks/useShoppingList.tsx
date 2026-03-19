import { deleteAllItems, deleteItem, toggleBuyed } from "@/actions/actions";
import { sortTableRows } from "@/lib/utils";
import { ListItemType } from "@/types/apiTypes";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useTableRows from "./useTableRows";

const getStoredAutoSortState = () =>
  JSON.parse(localStorage.getItem("shoppingList_autoSort") || "false");

export function useShoppingList(listId: number) {
  const [tableRows, setTableRows] = useState<ListItemType[]>([]);
  const [autoSort, setAutoSort] = useState(getStoredAutoSortState());

  const { data: fetchedRows, error, isLoading } = useTableRows(listId);

  // sync rows
  useEffect(() => {
    if (fetchedRows) {
      setTableRows(autoSort ? sortTableRows([...fetchedRows]) : fetchedRows);
    }
  }, [fetchedRows, autoSort]);

  // localStorage init
  useEffect(() => {
    setAutoSort(getStoredAutoSortState());
  }, []);

  // persist autoSort
  useEffect(() => {
    localStorage.setItem("shoppingList_autoSort", JSON.stringify(autoSort));
    if (autoSort) {
      setTableRows((prev) => sortTableRows([...prev]));
    }
  }, [autoSort]);

  // actions

  const reorder = (activeId: number, overId: number) => {
    setTableRows((items) => {
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const toggleItem = (item: ListItemType) => {
    setTableRows((prev) => {
      const newRows = prev.map((row) =>
        row.id === item.id ? { ...row, buyed: !row.buyed } : row,
      );
      return autoSort ? sortTableRows(newRows) : newRows;
    });

    toggleBuyed({
      buyed: !item.buyed,
      item_id: item.id,
      list_id: item.list_id,
    }).then((r) => {
      if (r.msg === "rejected") {
        setTableRows((prev) =>
          prev.map((row) => (row.id === item.id ? item : row)),
        );
      }
    });
  };

  const deleteItemAction = (item: ListItemType) => {
    const oldRows = [...tableRows];

    setTableRows((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      return autoSort ? sortTableRows(filtered) : filtered;
    });

    deleteItem({ item_id: item.id, list_id: item.list_id }).catch(() => {
      toast.error("Nie udało się usunąć");
      setTableRows(oldRows);
    });
  };

  const deleteAll = async () => {
    const oldRows = [...tableRows];
    const ids = tableRows.map((r) => r.id);

    setTableRows([]);

    try {
      await deleteAllItems({ items_ids: ids });
      toast.success("Wyczyszczono listę");
    } catch {
      setTableRows(oldRows);
      toast.error("Błąd usuwania");
    }
  };

  return {
    tableRows,
    autoSort,
    setAutoSort,
    reorder,
    toggleItem,
    deleteItemAction,
    deleteAll,
    error,
    isLoading,
  };
}
