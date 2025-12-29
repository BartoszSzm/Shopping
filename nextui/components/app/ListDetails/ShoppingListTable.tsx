"use client";

import {
  deleteAllItems,
  deleteItem,
  editItem,
  toggleBuyed,
} from "@/actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { sortTableRows } from "@/lib/utils";
import { ListItemType } from "@/types/apiTypes";
import { Package } from "lucide-react"; // Import dla pustego stanu
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AddEditListItemModal from "./ButtonsList/AddEditListItemModal";
import SettingsButton from "./ButtonsList/SettingsButton";
import TableRowActions from "./TableRowActions";

interface Props {
  headers: string[];
  rows: ListItemType[];
}

const ShoppingListTable = ({ headers, rows }: Props) => {
  const [editClicked, setEditClicked] = useState(false);
  const [clickedRow, setClickedRow] = useState<ListItemType | null>(null);
  const [tableRows, setTableRows] = useState<ListItemType[]>(rows);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    editItem({
      id: typeof data.id === "string" ? parseInt(data.id) : 0,
      ...data,
    });
  };

  const toggleBuyedItem = (item: ListItemType) => {
    setTableRows((prevRows) => {
      const newRows = prevRows.map((row) =>
        row.id === item.id ? { ...row, buyed: !row.buyed } : row
      );
      return sortTableRows(newRows);
    });
  };

  const removeItem = (item: ListItemType) => {
    setTableRows((prevRows) => {
      const newRows = prevRows.filter((i) => i.id !== item.id);
      return sortTableRows(newRows);
    });
  };

  const deleteAllAction = async () => {
    const oldRows = [...tableRows];
    setTableRows([]);
    await deleteAllItems({ items_ids: tableRows.map((row) => row.id) })
      .then(() => toast.success("All items removed!"))
      .catch((e) => {
        const err = e as Error;
        setTableRows(oldRows);
        toast.error(err.message);
      });
  };

  const onDeleteItemAction = (item: ListItemType) => {
    const oldRows = [...tableRows];
    removeItem(item);
    deleteItem({ item_id: item.id, list_id: item.list_id }).catch((e) => {
      const err = e as Error;
      toast.error(err.message);
      setTableRows(oldRows);
    });
  };

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  if (tableRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
        <Package size={40} className="mb-4 opacity-20" />
        <p className="font-medium">Ta lista jest pusta</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Nagłówek "Tabeli" */}
      <div className="grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center px-5 mb-4 text-[11px] font-bold text-zinc-400 tracking-widest uppercase">
        <div></div>
        {headers.map((header) => (
          <div key={header} className={header === "NAZWA" ? "" : "text-center"}>
            {header}
          </div>
        ))}
        <div className="flex justify-end">
          <SettingsButton deleteAllAction={deleteAllAction} />
        </div>
      </div>

      <AddEditListItemModal
        title="Edytuj element"
        open={editClicked}
        setOpen={setEditClicked}
        onSubmitAction={handleSubmit}
        values={{
          id: clickedRow?.id,
          name: clickedRow?.name,
          quantity: clickedRow?.quantity,
        }}
      />

      {/* Lista produktów */}
      <div className="space-y-2">
        {tableRows.map((row) => (
          <div
            key={row.id}
            className={`grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center p-4 bg-white border border-zinc-100 rounded-2xl transition-all duration-200 hover:border-zinc-200 hover:shadow-sm ${
              row.buyed ? "opacity-50 select-none" : ""
            }`}
          >
            {/* Checkbox */}
            <div className="flex justify-center">
              <Checkbox
                checked={row.buyed}
                className="h-5 w-5 rounded-md border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black transition-transform active:scale-90"
                onCheckedChange={(checked) => {
                  toggleBuyedItem(row);
                  toggleBuyed({
                    buyed: typeof checked === "boolean" ? checked : false,
                    item_id: row.id,
                    list_id: row.list_id,
                  }).then((r) => {
                    r.msg === "rejected" ? toggleBuyedItem(row) : null;
                  });
                }}
              />
            </div>

            {/* Nazwa */}
            <div
              className={`cursor-pointer font-semibold text-zinc-800 transition-all ${
                row.buyed ? "line-through text-zinc-400" : ""
              }`}
              onClick={() => {
                setEditClicked(true);
                setClickedRow(row);
              }}
            >
              {row.name}
            </div>

            {/* Ilość */}
            <div
              className="text-center"
              onClick={() => {
                setEditClicked(true);
                setClickedRow(row);
              }}
            >
              <span className="inline-block px-3 py-1 rounded-lg bg-zinc-50 text-zinc-600 text-sm font-mono border border-zinc-100 cursor-pointer">
                {row.quantity}
              </span>
            </div>

            {/* Ikona Typu */}
            <div className="text-center text-xl">{row.typeicon}</div>

            {/* Akcje */}
            <div className="flex justify-end">
              <TableRowActions
                onDeleteItemAction={() => onDeleteItemAction(row)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingListTable;
