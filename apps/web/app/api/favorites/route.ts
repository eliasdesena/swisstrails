import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type FavoriteRow = { location_id: string };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await (supabase.from("favorites" as never) as unknown as {
    select: (cols: string) => { eq: (col: string, val: string) => Promise<{ data: FavoriteRow[] | null; error: unknown }> };
  })
    .select("location_id")
    .eq("user_id", session.user.id);

  if (error || !data) {
    return NextResponse.json({ favoriteIds: [] });
  }

  return NextResponse.json({ favoriteIds: data.map((f) => f.location_id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await req.json();
  if (!locationId) {
    return NextResponse.json({ error: "Location ID required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await (supabase.from("favorites" as never) as ReturnType<typeof supabase.from>).insert({
    id: crypto.randomUUID(),
    user_id: session.user.id,
    location_id: locationId,
  } as never);

  if (error) {
    const err = error as { code?: string };
    if (err.code === "23505") {
      return NextResponse.json({ message: "Already favorited" });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await req.json();
  const supabase = await createClient();

  await (supabase.from("favorites" as never) as ReturnType<typeof supabase.from>)
    .delete()
    .eq("user_id" as never, session.user.id as never)
    .eq("location_id" as never, locationId as never);

  return NextResponse.json({ success: true });
}
