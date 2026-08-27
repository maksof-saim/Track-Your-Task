import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserAnalytics } from "@/lib/analytics";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("search") || "";
  const dateFilter = searchParams.get("date") || "";

  let users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Apply filters server-side
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  if (dateFilter) {
    users = users.filter(
      (user) => {
        const userDate = new Date(user.createdAt).toISOString().split('T')[0];
        return userDate === dateFilter;
      }
    );
  }

  const rows = await Promise.all(
    users.map(async (user) => ({
      ...user,
      analytics: await getUserAnalytics(user.id),
    })),
  );

  return NextResponse.json({ users: rows });
}
