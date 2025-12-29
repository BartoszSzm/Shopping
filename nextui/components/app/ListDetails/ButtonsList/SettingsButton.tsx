"use client";

import { Button } from "@/components/ui/button"; // Dodano Button dla spójności
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Settings, Sun, Trash2 } from "lucide-react"; // Zmiana na Lucide
import NoSleep from "nosleep.js";
import { useEffect, useRef, useState } from "react";
import { ConfirmationModal } from "../../utils/ConfirmationModal";

interface Props {
  deleteAllAction: () => void;
}

const SettingsButton = ({ deleteAllAction }: Props) => {
  const [noSleepState, setNoSleepState] = useState(false);
  const noSleepRef = useRef<NoSleep | null>(null);

  useEffect(() => {
    noSleepRef.current = new NoSleep();

    return () => {
      noSleepRef.current?.disable();
      noSleepRef.current = null;
    };
  }, []);

  const toggleNoSleep = () => {
    if (!noSleepRef.current) return;

    if (!noSleepState) {
      // Poprawiona logika wizualna (enable gdy chcemy noSleep)
      noSleepRef.current.enable();
    } else {
      noSleepRef.current.disable();
    }

    setNoSleepState((prev) => !prev);
  };

  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

  return (
    <DropdownMenu>
      <ConfirmationModal
        open={deleteAllModalOpen}
        onConfirm={deleteAllAction}
        onCancel={() => setDeleteAllModalOpen(false)}
      />

      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shadow-none border-none"
        >
          <Settings size={18} />
          <span className="sr-only">Ustawienia listy</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-56 rounded-2xl border-zinc-100 p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Opcje listy
        </div>

        <DropdownMenuItem
          onClick={toggleNoSleep}
          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-colors"
        >
          {noSleepState ? (
            <>
              <Sun size={16} className="text-yellow-500" />
              <span>Ekran zawsze włączony</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-zinc-400" />
              <span>Pozwól wygaszać ekran</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-100" />

        <DropdownMenuItem
          onClick={() => setDeleteAllModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl cursor-pointer transition-colors"
        >
          <Trash2 size={16} />
          Usuń wszystkie produkty
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsButton;
