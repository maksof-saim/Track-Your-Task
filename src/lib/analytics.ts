import { prisma } from "@/lib/prisma";
import { PRAYERS } from "@/lib/prayerMeta";
import { TILAWAT_ITEMS, HIFAZAT_ITEMS, isFriday } from "@/lib/checklistMeta";

export function isoDateDaysAgoUTC(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getUserAnalytics(userId: string, targetDate?: string) {
  const RANGE_DAYS = 30;
  const GRID_DAYS = 14;
  const since = new Date(`${isoDateDaysAgoUTC(RANGE_DAYS - 1)}T00:00:00.000`);

  // Use targetDate if provided, otherwise use today
  const todayIso = targetDate || isoDateDaysAgoUTC(0);

  // Run queries sequentially to avoid database connection pool exhaustion
  const prayerLogs = await prisma.prayerLog.findMany({
    where: { userId, date: { gte: since }, customPrayerId: null },
    orderBy: { date: "asc" },
  });

  const zikrLogs = await prisma.zikrLog.findMany({
    where: { userId, date: { gte: since }, customZikrId: null },
  });

  const checklistLogs = await prisma.checklistLog.findMany({
    where: { userId, date: { gte: since }, customTilawatId: null, customHifazatId: null },
  });

  const byDate = new Map<string, Record<string, string>>();
  for (const log of prayerLogs) {
    const iso = log.date.toISOString().slice(0, 10);
    if (!byDate.has(iso)) byDate.set(iso, {});
    if (log.prayer) {
      byDate.get(iso)![log.prayer] = log.status;
    }
  }

  const grid = Array.from({ length: GRID_DAYS }, (_, i) => {
    const iso = isoDateDaysAgoUTC(GRID_DAYS - 1 - i);
    const statuses = byDate.get(iso) ?? {};
    return {
      date: iso,
      statuses: Object.fromEntries(PRAYERS.map((p) => [p.key, statuses[p.key] ?? null])),
    };
  });

  let jamaat = 0;
  let infradi = 0;
  let qaza = 0;
  for (const log of prayerLogs) {
    if (log.status === "JAMAAT") jamaat++;
    else if (log.status === "INFRADI") infradi++;
    else if (log.status === "QAZA") qaza++;
  }
  const totalLogged = jamaat + infradi + qaza;

  const todayStatuses = byDate.get(todayIso) ?? {};
  const todayLoggedCount = Object.values(todayStatuses).filter(Boolean).length;

  const zikrToday = zikrLogs
    .filter((z) => z.date.toISOString().slice(0, 10) === todayIso)
    .reduce((sum, z) => sum + z.count, 0);
  const zikrTotal30d = zikrLogs.reduce((sum, z) => sum + z.count, 0);

  const todayChecklist = checklistLogs.filter((c) => c.date.toISOString().slice(0, 10) === todayIso);
  const tilawatTarget = isFriday(todayIso) ? TILAWAT_ITEMS.length : TILAWAT_ITEMS.length - 1;
  const tilawatToday = todayChecklist.filter((c) => c.section === "TILAWAT" && c.done).length;
  const hifazatToday = todayChecklist.filter((c) => c.section === "HIFAZAT" && c.done).length;

  return {
    grid,
    todayLoggedCount,
    totalPrayers: PRAYERS.length,
    infradiPercent: totalLogged ? Math.round((infradi / totalLogged) * 100) : 0,
    qazaCount: qaza,
    totalLogged,
    zikrToday,
    zikrTotal30d,
    tilawatToday,
    tilawatTarget,
    hifazatToday,
    hifazatTarget: HIFAZAT_ITEMS.length,
  };
}
