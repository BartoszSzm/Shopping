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
import { Plus } from "lucide-react"; // Zmiana na Lucide dla spójności
import { useRouter } from "next/navigation";
import { useState } from "react";
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
        toast.success(`Lista "${name}" została utworzona`);
        router.refresh();
      })
      .catch((e) => toast.error(`Błąd: ${e}`))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex items-center justify-between group">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {title}
      </h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="rounded-full h-12 w-12 bg-black hover:bg-zinc-800 shadow-lg transition-all hover:scale-105 active:scale-95"
            size="icon"
          >
            <Plus size={24} className="text-white" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Nowa lista
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-zinc-500 ml-1"
                >
                  Nazwa listy
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="np. Zakupy na weekend"
                  required
                  className="h-12 rounded-xl border-zinc-200 focus:ring-zinc-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-black hover:bg-zinc-800"
              >
                {loading ? "Tworzenie..." : "Utwórz listę"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListsHeader;
