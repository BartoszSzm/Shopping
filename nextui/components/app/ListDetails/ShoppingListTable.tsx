import { ListItemType } from "@/types/apiTypes";
import React from "react";

interface Props {
  headers: string[];
  rows: ListItemType[];
}

const ShoppingListTable = ({ headers, rows }: Props) => {
  return (
    <div className="grid grid-cols-5 gap-y-4 items-center">
      <div className="font-bold"></div>
      {headers.map((header) => (
        <div key={header} className="font-bold text-gray-600">
          {header}
        </div>
      ))}
      <hr className="col-span-5 border-gray-300" />
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <div>{row.buyed ? "✅" : "⬜"}</div>
          <div>{row.name}</div>
          <div>{row.quantity}</div>
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
