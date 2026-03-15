import { getLists, getSharedLists } from "@/actions/actions";
import ListItem from "@/components/app/Lists/ListItem";
import ListsHeader from "@/components/app/Lists/ListsHeader";

const MainPage = async () => {
  const [myLists, sharedLists] = await Promise.all([
    getLists(),
    getSharedLists(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-zinc-200">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <ListsHeader title="Twoje listy" />

        <div className="flex flex-col gap-4 mt-8">
          {myLists.length > 0 ? (
            myLists.map((l) => <ListItem list={l} key={l.id} />)
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400">Nie masz jeszcze żadnych list.</p>
            </div>
          )}
        </div>

        {sharedLists.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6 ml-1">
              Udostępnione Tobie
            </h2>
            <div className="flex flex-col gap-4 opacity-85 grayscale-[0.3] hover:grayscale-0 hover:opacity-100 transition-all">
              {sharedLists.map((l) => (
                <div
                  key={l.id}
                  className="[&>a]:bg-zinc-50/50 [&>a]:border-dashed"
                >
                  <ListItem list={l} showOwner={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
