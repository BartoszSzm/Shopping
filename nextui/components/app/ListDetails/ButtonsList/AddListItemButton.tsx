"use client";

import { newListItem } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

interface Props {
  listId: number;
}

const AddListItemButton = ({ listId }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    // Zod here
    const name = formData.get("name")?.toString().trim();
    const quantity = formData.get("quantity")?.toString();

    if (name === undefined && quantity === undefined) return;

    setLoading(true);
    newListItem({ list_id: listId, name: name, quantity: quantity })
      .then(() => {
        setOpen(false);
        toast.success(`Element ${name} został dodany!`);
        router.refresh();
      })
      .catch((e) => toast.error(`Wystąpił błąd! ${e}`))
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="p-8 w-20">
          <FaPlus />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Dodaj element</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2 grid-cols-2">
              <Label htmlFor="name">Nazwa</Label>
              <Label htmlFor="quantity">Ilość</Label>
              <Input id="name" name="name" placeholder="Jabłko" required />
              <Input
                id="quantity"
                name="quantity"
                placeholder="1"
                type="number"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListItemButton;
