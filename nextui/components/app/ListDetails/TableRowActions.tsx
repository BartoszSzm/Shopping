"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react"; // Zmieniono na Lucide dla spójności

interface Props {
  onDeleteItemAction: () => void;
}

const TableRowActions = ({ onDeleteItemAction }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus-visible:ring-zinc-400"
        >
          <MoreVertical size={18} />
          <span className="sr-only">Otwórz menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border-zinc-100 p-1 shadow-xl animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuItem
          onClick={onDeleteItemAction}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer transition-colors"
        >
          <Trash2 size={16} />
          Usuń produkt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableRowActions;
