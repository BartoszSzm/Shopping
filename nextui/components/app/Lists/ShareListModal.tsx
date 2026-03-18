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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SetableRoles, ShareListInput } from "@/types/apiTypes";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  listId: number;
  onSubmitAction: (data: ShareListInput) => Promise<void>;
}

const ShareListModal = ({ open, setOpen, listId, onSubmitAction }: Props) => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<SetableRoles>("viewer");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    setLoading(true);
    try {
      await onSubmitAction({ email, role, listId });
      toast.success(`Udostępniono listę użytkownikowi ${email}`);
      setOpen(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md top-[30%]">
        <DialogHeader>
          <DialogTitle>Udostępnij listę</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email użytkownika</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="przyklad@domena.pl"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Rola</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as SetableRoles)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rolę" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Widz (tylko podgląd)</SelectItem>
                <SelectItem value="editor">Edytor (może zmieniać)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Udostępnianie..." : "Udostępnij"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListModal;
