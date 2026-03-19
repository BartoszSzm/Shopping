"use client";

import { editItem, newListItem } from "@/actions/actions";
import { Switch } from "@/components/ui/switch";
import { ListItemType } from "@/types/apiTypes";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2, Package } from "lucide-react"; // Dodany Loader2 jako spinner
import React, { useState } from "react";
import { toast } from "sonner";
import AddEditListItemModal from "./ButtonsList/AddEditListItemModal";
import ButtonsList from "./ButtonsList/ButtonsList";
import SettingsButton from "./ButtonsList/SettingsButton";
import SortableRow from "./SortableRow";
import { useShoppingList } from "./hooks/useShoppingList";

interface Props {
  headers: string[];
  listId: number;
}

const ShoppingListTable = ({ headers, listId }: Props) => {
  const [editClicked, setEditClicked] = useState(false);
  const [clickedRow, setClickedRow] = useState<ListItemType | null>(null);

  const {
    tableRows,
    autoSort,
    setAutoSort,
    reorder,
    toggleItem,
    deleteItemAction,
    deleteAll,
    isLoading,
    refetch,
  } = useShoppingList(listId);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(active.id as number, over.id as number);
    }
  };

  const edit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await editItem({
        id: typeof data.id === "string" ? parseInt(data.id) : 0,
        ...data,
      });
      setEditClicked(false);
      refetch();
    } catch (error) {
      toast.error("Błąd podczas edycji");
    }
  };

  const addItem = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();
    let quantity = formData.get("quantity")?.toString();

    if (name === undefined || quantity === undefined) return;

    // @ts-ignore
    newListItem({ list_id: listId, name: name, quantity: quantity })
      .then(() => {
        // TODO - change to optimistic update
        refetch();
      })
      .catch(() => toast.error("Błąd podczas dodawania"));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Ładowanie listy...</p>
      </div>
    );
  }

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
      <div className="flex justify-end items-center px-5 mb-4">
        <div className="flex items-center space-x-2 bg-zinc-50/50 px-3 py-2 rounded-xl border border-zinc-100">
          <label
            htmlFor="auto-sort-switch"
            className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase cursor-pointer transition-colors"
          >
            Auto sort{" "}
            {autoSort && (
              <span className="text-[8px] opacity-60">(DND OFF)</span>
            )}
          </label>
          <Switch
            id="auto-sort-switch"
            checked={autoSort}
            onCheckedChange={setAutoSort}
          />
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center px-5 mb-4 text-[11px] font-bold text-zinc-400 tracking-widest uppercase">
        <div></div>
        {headers.map((header) => (
          <div key={header} className={header === "NAZWA" ? "" : "text-center"}>
            {header}
          </div>
        ))}
        <div className="flex justify-end">
          <SettingsButton deleteAllAction={deleteAll} />
        </div>
      </div>

      <AddEditListItemModal
        title="Edytuj element"
        open={editClicked}
        setOpen={setEditClicked}
        onSubmitAction={edit}
        values={{
          id: clickedRow?.id,
          name: clickedRow?.name,
          quantity: clickedRow?.quantity,
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={tableRows.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tableRows.map((row) => (
              <SortableRow
                key={row.id}
                row={row}
                disabled={autoSort}
                onToggle={toggleItem}
                onDelete={deleteItemAction}
                onEdit={(r) => {
                  setClickedRow(r);
                  setEditClicked(true);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ButtonsList listId={listId} onAddItemAction={addItem} />
    </div>
  );
};

export default ShoppingListTable;
