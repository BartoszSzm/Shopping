"use client";

import { deleteList } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { URLS } from "@/lib/apiClient";
import { List } from "@/types/list";
import { ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ListItem = ({ list }: { list: List }) => {
  const router = useRouter();

  const handleDelete = () => {
    deleteList({ id: list.id })
      .then(() => {
        toast.success(`Usunięto listę ${list.name}`);
        router.refresh();
      })
      .catch((e) => toast.error(`Wystąpił błąd! ${e}`));
  };

  return (
    <Card className="group relative overflow-hidden border-zinc-100 bg-white hover:border-zinc-200 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between p-5">
        <Link
          href={URLS.app.listDetails(list.id)}
          className="flex-1 flex items-center gap-3 group/link"
        >
          <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover/link:bg-zinc-100 transition-colors">
            <ChevronRight
              size={18}
              className="text-zinc-400 group-hover/link:text-zinc-900 transition-colors"
            />
          </div>
          <span className="font-semibold text-zinc-700 group-hover/link:text-black transition-colors">
            {list.name}
          </span>
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
  );
};

export default ListItem;
