import { getLists } from "@/actions/actions";
import ListItem from "@/components/app/Lists/ListItem";
import ListsHeader from "@/components/app/Lists/ListsHeader";

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
