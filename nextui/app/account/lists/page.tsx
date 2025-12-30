import { getLists } from "@/actions/actions";
import ListItem from "@/components/app/Lists/ListItem";
import ListsHeader from "@/components/app/Lists/ListsHeader";

const MainPage = async () => {
  const allLists = await getLists();

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-zinc-200">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <ListsHeader title="Twoje listy" />

        <div className="flex flex-col gap-4 mt-8">
          {allLists.length > 0 ? (
            allLists.map((l) => <ListItem list={l} key={l.id} />)
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400">Nie masz jeszcze żadnych list.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
