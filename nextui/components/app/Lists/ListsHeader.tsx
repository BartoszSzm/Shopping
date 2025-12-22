"use client";

import { newList } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

const ListsHeader = ({ title }: { title: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();

    if (!name) return;

    setLoading(true);
    newList({ name })
      .then(() => {
        setOpen(false);
        toast.success(`Lista ${name} została dodana!`);
        router.refresh();
      })
      .catch((e) => toast.error(`Wystąpił błąd! ${e}`))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <span>{title}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon">
            <FaPlus />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nowa lista</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nazwa</Label>
                <Input id="name" name="name" placeholder="Zakupy" required />
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
    </div>
  );
};

export default ListsHeader;
