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
    return <div>Ta lista jest pusta</div>;
  }

  return (
    <div className="grid grid-cols-5 gap-y-4 items-center">
      <div className="font-bold"></div>
      {headers.map((header) => (
        <div key={header} className="font-bold text-gray-600">
          {header}
        </div>
      ))}
      <SettingsButton deleteAllAction={deleteAllAction}></SettingsButton>
      <hr className="col-span-5 border-gray-300" />
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
      {tableRows.map((row) => (
        <React.Fragment key={row.id}>
          <Checkbox
            checked={row.buyed}
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
          <div
            onClick={() => {
              setEditClicked(true);
              setClickedRow(row);
            }}
          >
            {row.name}
          </div>
          <div
            onClick={() => {
              setEditClicked(true);
              setClickedRow(row);
            }}
          >
            {row.quantity}
          </div>
          <div>{row.typeicon}</div>
          <div>
            <TableRowActions
              onDeleteItemAction={() => onDeleteItemAction(row)}
            ></TableRowActions>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ShoppingListTable;
