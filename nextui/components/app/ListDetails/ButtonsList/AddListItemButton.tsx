"use client";

import { newListItem } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddEditListItemModal from "./AddEditListItemModal";

interface Props {
  listId: number;
}

const AddListItemButton = ({ listId }: Props) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onSubmitAction = async (e: React.FormEvent<HTMLFormElement>) => {
    // Zachowujemy Twoją logikę biznesową
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();
    let quantity = formData.get("quantity")?.toString();

    if (name === undefined || quantity === undefined) return;

    // Tutaj warto dodać .then(() => setOpen(false)) jeśli chcesz zamykać modal po sukcesie
    // @ts-ignore
    newListItem({ list_id: listId, name: name, quantity: quantity });
  };

  return (
    <>
      <AddEditListItemModal
        title="Dodaj do listy"
        open={open}
        setOpen={setOpen}
        onSubmitAction={onSubmitAction}
      />

      {/* Przycisk dostosowany do paska akcji */}
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
