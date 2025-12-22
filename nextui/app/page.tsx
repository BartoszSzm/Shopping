import ListItem from "@/components/app/Lists/ListItem";
import ListsHeader from "@/components/app/Lists/ListsHeader";
import { URLS } from "@/lib/apiClient";
import { ListItemType } from "@/types/apiTypes";

async function getLists(): Promise<ListItemType[]> {
  const res = await fetch(URLS.allLists());

  if (!res.ok) {
    throw new Error("Nie można pobrać list");
  }

  return res.json();
}

const MainPage = async () => {
  const allLists = await getLists();

  return (
    <div className="px-10 py-3">
      <ListsHeader title="Twoje listy" />

      <div className="flex flex-col gap-3">
        {allLists.map((l) => (
          <ListItem list={l} key={l.id}></ListItem>
        ))}
      </div>
    </div>
  );
};

export default MainPage;
