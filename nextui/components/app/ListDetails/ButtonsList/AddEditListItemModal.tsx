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
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuantity(values?.quantity ?? 1);
    }
  }, [open, values]);

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

  const adjustQuantity = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] top-[30%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={values?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Ilość</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => adjustQuantity(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <Input
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    type="number"
                    className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => adjustQuantity(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <input type="hidden" name="id" value={values?.id ?? ""} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditListItemModal;
