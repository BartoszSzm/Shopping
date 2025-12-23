"use client";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {};

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
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <div>{row.buyed ? "✅" : "⬜"}</div>
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
