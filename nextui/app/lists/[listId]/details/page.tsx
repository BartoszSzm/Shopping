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
  const headers = ["NAZWA", "ILOŚĆ", "TYP", "SETTINGS"];

  const { listId } = await params;

  const listDetailsData: ShoppingListResponse = await getListDetails(listId);

  const rows = sortTableRows(listDetailsData.list_items);

  return (
    <div>
      <ShoppingListTable headers={headers} rows={rows} />
      <ButtonsList listId={listDetailsData.list_id} />
    </div>
  );
};

export default ShoppingListDetails;
