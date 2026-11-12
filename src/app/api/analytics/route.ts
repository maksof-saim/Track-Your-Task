import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserAnalytics } from "@/lib/analytics";
import { resolveClientToday } from "@/lib/dateUtils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const today = resolveClientToday(searchParams.get("today"));

  const analytics = await getUserAnalytics(session.user.id, today);
  return NextResponse.json(analytics);
}