import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const isoDate = (value: Date) => value.toISOString().slice(0, 10);

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
    });
    if (!user) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Run queries one after another to avoid exhausting the database connection pool.
    const prayerLogs = await prisma.prayerLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
    const zikrLogs = await prisma.zikrLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
    const checklistLogs = await prisma.checklistLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
    const attendanceLogs = await prisma.attendanceLog.findMany({ where: { userId }, orderBy: { date: "asc" } });
    const customPrayers = await prisma.customPrayer.findMany({ where: { userId } });
    const customZikrs = await prisma.customZikr.findMany({ where: { userId } });
    const customTilawats = await prisma.customTilawat.findMany({ where: { userId } });
    const customHifazats = await prisma.customHifazat.findMany({ where: { userId } });

    const data = {
        exportedAt: new Date().toISOString(),
        profile: { name: user.name, email: user.email, createdAt: user.createdAt.toISOString() },
        prayerLogs: prayerLogs.map((log) => ({
            date: isoDate(log.date),
            prayer: log.prayer,
            customPrayerId: log.customPrayerId,
            status: log.status,
        })),
        zikrLogs: zikrLogs.map((log) => ({
            date: isoDate(log.date),
            name: log.name,
            mode: log.mode,
            count: log.count,
            customZikrId: log.customZikrId,
        })),
        checklistLogs: checklistLogs.map((log) => ({
            date: isoDate(log.date),
            section: log.section,
            item: log.item,
            done: log.done,
            customTilawatId: log.customTilawatId,
            customHifazatId: log.customHifazatId,
        })),
        attendanceLogs: attendanceLogs.map((log) => ({
            date: isoDate(log.date),
            status: log.status,
            applicationStatus: log.applicationStatus,
            applicationNote: log.applicationNote,
        })),
        customPrayers: customPrayers.map((item) => ({ id: item.id, name: item.name })),
        customZikrs: customZikrs.map((item) => ({ id: item.id, name: item.name, hasCount: item.hasCount })),
        customTilawats: customTilawats.map((item) => ({ id: item.id, name: item.name })),
        customHifazats: customHifazats.map((item) => ({ id: item.id, name: item.name, hint: item.hint })),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="track-your-amaal-data-${isoDate(new Date())}.json"`,
            "Cache-Control": "no-store",
        },
    });
}