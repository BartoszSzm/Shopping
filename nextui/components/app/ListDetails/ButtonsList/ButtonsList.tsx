"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/apiClient";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AddListItemButton from "./AddListItemButton";

interface Props {
  listId: number;
}

const ButtonsList = ({ listId }: Props) => {
  const router = useRouter();
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none">
      <div className="flex items-center gap-3 p-2 bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-full shadow-2xl pointer-events-auto">
        <Button
          variant="ghost"
          className="rounded-full h-14 w-14 hover:bg-zinc-100 transition-colors"
          onClick={() => router.push(URLS.app.lists())}
        >
          <ChevronLeft size={24} className="text-zinc-600" />
        </Button>

        <div className="h-8 w-px bg-zinc-200 mx-1" />

        <AddListItemButton listId={listId} />
      </div>
    </div>
  );
};

export default ButtonsList;
