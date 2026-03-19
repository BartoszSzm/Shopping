"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEditListItemModal from "./AddEditListItemModal";

interface Props {
  onAddItemAction: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const AddListItemButton = ({ onAddItemAction }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddEditListItemModal
        title="Dodaj do listy"
        open={open}
        setOpen={setOpen}
        onSubmitAction={onAddItemAction}
      />

      <Button
        className="h-14 px-8 rounded-full bg-black hover:bg-zinc-800 text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
        onClick={() => setOpen(true)}
      >
        <Plus
          size={20}
          className="transition-transform group-hover:rotate-90 duration-300"
        />
        <span className="font-semibold tracking-tight">Dodaj</span>
      </Button>
    </>
  );
};

export default AddListItemButton;
