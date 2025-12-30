import { getListDetails } from "@/actions/actions";
import ButtonsList from "@/components/app/ListDetails/ButtonsList/ButtonsList";
import ShoppingListTable from "@/components/app/ListDetails/ShoppingListTable";
import { sortTableRows } from "@/lib/utils";
import { ShoppingListResponse } from "@/types/apiTypes";

const ShoppingListDetails = async ({
  params,
}: {
  params: Promise<{ listId: number }>;
}) => {
  const headers = ["NAZWA", "ILOŚĆ", "TYP"];
  const { listId } = await params;
  const listDetailsData: ShoppingListResponse = await getListDetails(listId);
  const rows = sortTableRows(listDetailsData.list_items);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Szczegóły listy
          </h1>
          <p className="text-zinc-500">Zarządzaj swoimi produktami</p>
        </div>

        <ShoppingListTable headers={headers} rows={rows} />
      </div>

      <ButtonsList listId={listDetailsData.list_id} />
    </div>
  );
};

export default ShoppingListDetails;
