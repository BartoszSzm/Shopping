"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoSleep from "nosleep.js";
import { useEffect, useRef, useState } from "react";
import { IoMdSettings } from "react-icons/io";
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

    if (noSleepState) {
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
      <DropdownMenuTrigger>
        <IoMdSettings />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start">
        <DropdownMenuItem onClick={() => setDeleteAllModalOpen(true)}>
          Usuń wszystko
        </DropdownMenuItem>

        <DropdownMenuItem onClick={toggleNoSleep}>
          {noSleepState ? "Wygaszanie aktywne" : "Wygaszanie nieaktywne"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsButton;
