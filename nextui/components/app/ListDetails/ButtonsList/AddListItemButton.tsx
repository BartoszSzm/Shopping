"use client";

import { newListItem } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AddEditListItemModal from "./AddEditListItemModal";

interface Props {
  listId: number;
}

const AddListItemButton = ({ listId }: Props) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onSubmitAction = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    // Zod here
    const name = formData.get("name")?.toString().trim();
    const quantity = formData.get("quantity")?.toString();

    if (name === undefined && quantity === undefined) return;

    newListItem({ list_id: listId, name: name, quantity: quantity });
  };

  return (
    <>
      <AddEditListItemModal
        title="Dodaj element"
        open={open}
        setOpen={setOpen}
        onSubmitAction={onSubmitAction}
      />
      <Button className="p-8 w-20" onClick={() => setOpen(true)}>
        <FaPlus />
      </Button>
    </>
  );
};

export default AddListItemButton;
