import ShoppingListTable from "@/components/app/ListDetails/ShoppingListTable";

const ShoppingListDetails = async ({
  params,
}: {
  params: Promise<{ listId: number }>;
}) => {
  const headers = ["NAZWA", "ILOŚĆ", "TYP"];
  const { listId } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Szczegóły listy
          </h1>
          <p className="text-zinc-500">Zarządzaj swoimi produktami</p>
        </div>

        <ShoppingListTable headers={headers} listId={listId} />
      </div>
    </div>
  );
};

export default ShoppingListDetails;
