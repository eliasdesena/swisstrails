import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLACEHOLDER_LOCATIONS } from "@/data/locations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const difficulty = searchParams.get("difficulty");
  const q = searchParams.get("q")?.toLowerCase();

  // When Supabase is configured, query from DB.
  // For now, filter placeholder data.
  let locations = PLACEHOLDER_LOCATIONS;

  if (category) {
    locations = locations.filter((l) => l.category === category);
  }
  if (region) {
    locations = locations.filter((l) => l.region === region);
  }
  if (difficulty) {
    locations = locations.filter((l) => l.difficulty === difficulty);
  }
  if (q) {
    locations = locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.tagline.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ locations, total: locations.length });
}
