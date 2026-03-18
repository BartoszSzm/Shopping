import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmationModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function ConfirmationModal({
  open,
  title = "Potwierdzenie",
  description = "Czy na pewno chcesz kontynuować?",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="top-[30%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex w-full justify-around gap-4">
            <Button onClick={onConfirm} variant={"destructive"}>
              Potwierdź
            </Button>
            <Button onClick={onCancel}>Anuluj</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
