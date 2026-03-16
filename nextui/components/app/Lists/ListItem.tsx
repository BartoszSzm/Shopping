"use client";

import { deleteList, shareList } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { URLS } from "@/lib/apiClient";
import { ShareListInput } from "@/types/apiTypes";
import { List } from "@/types/list";
import {
  ChevronRight,
  MoreHorizontal,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ShareListModal from "./ShareListModal";

interface ListItemProps {
  list: List;
  showOwner?: boolean;
}

const ListItem = ({ list, showOwner = false }: ListItemProps) => {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDelete = () => {
    deleteList({ id: list.id })
      .then(() => {
        toast.success(`Usunięto listę ${list.name}`);
        router.refresh();
      })
      .catch((e) => toast.error(`Wystąpił błąd! ${e}`));
  };

  const handleShare = async (data: ShareListInput) => {
    await shareList(data);
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-zinc-100 bg-white hover:border-zinc-200 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md">
        <div className="flex items-center justify-between p-5">
          <Link
            href={URLS.app.listDetails(list.id)}
            className="flex-1 flex items-center gap-4 group/link"
          >
            <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover/link:bg-zinc-100 transition-colors shrink-0">
              <ChevronRight
                size={18}
                className="text-zinc-400 group-hover/link:text-zinc-900 transition-colors"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-zinc-700 group-hover/link:text-black transition-colors leading-tight">
                {list.name}
              </span>
              {showOwner && (
                <div className="flex items-center gap-1.5 mt-0.5 text-zinc-400 font-medium text-xs">
                  <User size={12} className="opacity-70" />
                  <span>{list.name}</span>
                </div>
              )}
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900"
              >
                <MoreHorizontal size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-zinc-100 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setIsShareModalOpen(true)}
                className="gap-2 cursor-pointer"
              >
                <Share2 size={16} />
                Udostępnij listę
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 gap-2 cursor-pointer"
              >
                <Trash2 size={16} />
                Usuń listę
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <ShareListModal
        open={isShareModalOpen}
        setOpen={setIsShareModalOpen}
        listId={list.id}
        onSubmitAction={handleShare}
      />
    </>
  );
};

export default ListItem;
