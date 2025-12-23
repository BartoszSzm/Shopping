"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import AddListItemButton from "./AddListItemButton";

interface Props {
  listId: number;
}

const ButtonsList = ({ listId }: Props) => {
  const router = useRouter();
  return (
    <div className="fixed bottom-10 w-full flex justify-around">
      <AddListItemButton listId={listId} />
      <Button
        className="p-8 w-20"
        onClick={() => router.push(URLS.app.lists())}
      >
        <IoIosArrowBack />
      </Button>
    </div>
  );
};

export default ButtonsList;
