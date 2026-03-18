"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ListItemType } from "@/types/apiTypes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import TableRowActions from "./TableRowActions";

const SortableRow = ({
  row,
  onToggle,
  onEdit,
  onDelete,
  disabled,
}: {
  row: ListItemType;
  onToggle: (row: ListItemType) => void;
  onEdit: (row: ListItemType) => void;
  onDelete: (row: ListItemType) => void;
  disabled: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, disabled });

  const style = {
    transition: transition || undefined,
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 50 : 0,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center p-4 bg-white border rounded-2xl ${
        isDragging
          ? "border-black shadow-2xl scale-[1.02] z-50 opacity-95 ring-4 ring-black/5"
          : "border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all duration-200"
      } ${row.buyed ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-center gap-2">
        {!disabled && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
          >
            <GripVertical size={18} />
          </div>
        )}
        <Checkbox
          checked={row.buyed}
          className="h-5 w-5 rounded-md border-zinc-300 data-[state=checked]:bg-black"
          onCheckedChange={() => onToggle(row)}
        />
      </div>

      <div
        className={`cursor-pointer font-semibold text-zinc-800 ${row.buyed ? "line-through text-zinc-400" : ""}`}
        onClick={() => onEdit(row)}
      >
        {row.name}
      </div>

      <div className="text-center" onClick={() => onEdit(row)}>
        <span className="inline-block px-3 py-1 rounded-lg bg-zinc-50 text-zinc-600 text-sm font-mono border border-zinc-100">
          {row.quantity}
        </span>
      </div>
      <div className="text-center text-xl">{row.typeicon}</div>
      <div className="flex justify-end">
        <TableRowActions onDeleteItemAction={() => onDelete(row)} />
      </div>
    </div>
  );
};

export default SortableRow;
