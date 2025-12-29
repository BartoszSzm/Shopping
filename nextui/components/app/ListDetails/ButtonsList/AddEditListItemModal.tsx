"use client";

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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  title?: string;
  setOpen: (open: boolean) => void;
  onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  onErrorAction?: () => void;
  values?: { id?: number; name?: string; quantity?: number };
}

const AddEditListItemModal = ({
  open,
  setOpen,
  onSubmitAction,
  title = "Dodaj / edytuj element",
  errorMessage = "Wystąpił błąd!",
  successMessage = "Zapisano pomyślnie!",
  values,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await onSubmitAction(e)
      .then(() => {
        setOpen(false);
        toast.success(successMessage);
        router.refresh();
      })
      .catch((e) => {
        toast.error(`${errorMessage} ${e}`);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-106.25 top-[30%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 grid-cols-2">
              <Label htmlFor="name">Nazwa</Label>
              <Label htmlFor="quantity">Ilość</Label>
              <Input id="id" name="id" defaultValue={values?.id} hidden />
              <Input
                id="name"
                name="name"
                defaultValue={values?.name ?? ""}
                required
              />
              <Input
                id="quantity"
                name="quantity"
                defaultValue={
                  values?.quantity ? values.quantity.toString() : ""
                }
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

export default AddEditListItemModal;
