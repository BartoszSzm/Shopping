"use client";

import { toggleBuyed } from "@/actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { sortTableRows } from "@/lib/utils";
import { ListItemType } from "@/types/apiTypes";
import React, { useState } from "react";
import AddEditListItemModal from "./ButtonsList/AddEditListItemModal";

interface Props {
  headers: string[];
  rows: ListItemType[];
}

const ShoppingListTable = ({ headers, rows }: Props) => {
  const [editClicked, setEditClicked] = useState(false);
  const [clickedRow, setClickedRow] = useState<ListItemType | null>(null);
  const [tableRows, setTableRows] = useState<ListItemType[]>(rows);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};

  const toggleBuyedItem = (item: ListItemType) => {
    setTableRows((prevRows) => {
      const newRows = prevRows.map((row) =>
        row.id === item.id ? { ...row, buyed: !row.buyed } : row
      );
      return sortTableRows(newRows);
    });
  };

  return (
    <div className="grid grid-cols-5 gap-y-4 items-center">
      <div className="font-bold"></div>
      {headers.map((header) => (
        <div key={header} className="font-bold text-gray-600">
          {header}
        </div>
      ))}
      <hr className="col-span-5 border-gray-300" />
      <AddEditListItemModal
        title="Edytuj element"
        open={editClicked}
        setOpen={setEditClicked}
        onSubmitAction={handleSubmit}
        values={{
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
                buyed: checked,
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
            <button className="text-xs bg-gray-100 p-1 rounded">Edytuj</button>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ShoppingListTable;
