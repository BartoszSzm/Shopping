import { ListItemType } from "@/types/apiTypes";
import { useQuery } from "@tanstack/react-query";

export function useTableRows(listId: number) {
  return useQuery<ListItemType[]>({
    queryKey: ["tableRows", listId],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}`);
      if (!response.ok) {
        throw new Error("Błąd podczas pobierania danych listy");
      }
      return response.json();
    },
    refetchInterval: 5000,
    enabled: !!listId,
  });
}
export default useTableRows;
