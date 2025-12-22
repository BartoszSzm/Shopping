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
import { List } from "@/types/list";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

const ListItem = ({ list }: { list: List }) => {
  const router = useRouter();
  return (
    <Card>
      <div className="flex justify-between">
        <span>{list.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FaChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                deleteList({ id: list.id })
                  .then(() => {
                    toast.success(`Lista ${list.name} została usunięta!`);
                    router.refresh();
                  })
                  .catch((e) => toast.error(`Wystąpił bląd! ${e}`))
              }
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default ListItem;
