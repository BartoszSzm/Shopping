import { getListDetails } from "@/actions/actions";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { id } = await params;

    const listId = Number(id);

    if (!Number.isInteger(listId) || listId < 1) {
      return NextResponse.json({ error: "Niepoprawne ID" }, { status: 400 });
    }

    const result = await getListDetails(listId);

    if ("status" in result) {
      return NextResponse.json(
        { error: result.msg || "Błąd operacji" },
        { status: result.status === "rejected" ? 400 : 200 },
      );
    }

    return NextResponse.json(result.list_items, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("Błąd w API route:", error);
    return NextResponse.json(
      { error: err.message || "Wystąpił wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}
