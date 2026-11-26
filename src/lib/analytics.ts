import { prisma } from "@/lib/prisma";
import { PRAYERS, FARD_PRAYERS } from "@/lib/prayerMeta";
import { TILAWAT_ITEMS, HIFAZAT_ITEMS, isFriday } from "@/lib/checklistMeta";

/** Today's date in UTC (YYYY-MM-DD) minus N days, independent of the machine's time zone. */
export function isoDateDaysAgoUTC(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date by N days using plain calendar math. */
function shiftIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export async function getUserAnalytics(userId: string, targetDate?: string) {
  const RANGE_DAYS = 30;
  const GRID_DAYS = 14;

  // The user's own "today" (sent by the browser), or the server's UTC date as a fallback.
  const todayIso = targetDate || isoDateDaysAgoUTC(0);
  const since = new Date(`${shiftIso(todayIso, -(RANGE_DAYS - 1))}T00:00:00.000Z`);

  // Run queries sequentially to avoid database connection pool exhaustion
  const prayerLogs = await prisma.prayerLog.findMany({
    where: { userId, date: { gte: since }, customPrayerId: null },
    orderBy: { date: "asc" },
  });

  const customPrayerLogs = await prisma.prayerLog.findMany({
    where: { userId, date: { gte: since }, customPrayerId: { not: null } },
    orderBy: { date: "asc" },
  });

  const customPrayers = await prisma.customPrayer.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  const zikrLogs = await prisma.zikrLog.findMany({
    where: { userId, date: { gte: since } },
  });

  // Custom tilawat/hifazat items are included so their records count in the summary too.
  const checklistLogs = await prisma.checklistLog.findMany({
    where: { userId, date: { gte: since } },
  });

  const customTilawatCount = await prisma.customTilawat.count({ where: { userId } });
  const customHifazatCount = await prisma.customHifazat.count({ where: { userId } });

  const byDate = new Map<string, Record<string, string>>();
  for (const log of prayerLogs) {
    const iso = log.date.toISOString().slice(0, 10);
    if (!byDate.has(iso)) byDate.set(iso, {});
    if (log.prayer) {
      byDate.get(iso)![log.prayer] = log.status;
    }
  }

  const customByDate = new Map<string, Record<string, string>>();
  for (const log of customPrayerLogs) {
    if (!log.customPrayerId) continue;
    const iso = log.date.toISOString().slice(0, 10);
    if (!customByDate.has(iso)) customByDate.set(iso, {});
    customByDate.get(iso)![log.customPrayerId] = log.status;
  }

  const grid = Array.from({ length: GRID_DAYS }, (_, i) => {
    const iso = shiftIso(todayIso, -(GRID_DAYS - 1 - i));
    const statuses = byDate.get(iso) ?? {};
    return {
      date: iso,
      statuses: Object.fromEntries(PRAYERS.map((p) => [p.key, statuses[p.key] ?? null])),
    };
  });

  // One row per custom prayer so the dashboard heatmap shows them next to the daily prayers.
  const customPrayerRows = customPrayers.map((prayer) => ({
    id: prayer.id,
    name: prayer.name,
    statuses: Object.fromEntries(
      grid.map((day) => [day.date, customByDate.get(day.date)?.[prayer.id] ?? null]),
    ),
  }));

  let jamaat = 0;
  let infradi = 0;
  let qaza = 0;
  let other = 0;
  for (const log of [...prayerLogs, ...customPrayerLogs]) {
    if (log.status === "JAMAAT") jamaat++;
    else if (log.status === "INFRADI") infradi++;
    else if (log.status === "QAZA") qaza++;
    else other++;
  }
  const totalLogged = jamaat + infradi + qaza + other;

  const todayStatuses = byDate.get(todayIso) ?? {};
  const fardKeys = new Set(FARD_PRAYERS.map((p) => p.key));
  const todayLoggedCount = Object.entries(todayStatuses).filter(
    ([key, status]) => status && fardKeys.has(key as (typeof FARD_PRAYERS)[number]["key"]),
  ).length;

  const todayZikrLogs = zikrLogs.filter((z) => z.date.toISOString().slice(0, 10) === todayIso);
  // Kasrat entries save count 0 because the exact number is not tracked, so they are
  // reported as a number of kasrat entries instead of adding zero to the count.
  const zikrToday = todayZikrLogs
    .filter((z) => z.mode === "COUNT")
    .reduce((sum, z) => sum + z.count, 0);
  const zikrKasratToday = todayZikrLogs.filter((z) => z.mode === "KASRAT").length;
  const zikrTotal30d = zikrLogs.reduce((sum, z) => sum + z.count, 0);

  const todayChecklist = checklistLogs.filter((c) => c.date.toISOString().slice(0, 10) === todayIso);
  const tilawatBuiltInTarget = isFriday(todayIso) ? TILAWAT_ITEMS.length : TILAWAT_ITEMS.length - 1;
  const tilawatTarget = tilawatBuiltInTarget + customTilawatCount;
  const tilawatToday = todayChecklist.filter((c) => c.section === "TILAWAT" && c.done).length;
  const hifazatToday = todayChecklist.filter((c) => c.section === "HIFAZAT" && c.done).length;

  return {
    grid,
    customPrayers: customPrayerRows,
    todayLoggedCount,
    totalPrayers: FARD_PRAYERS.length,
    infradiPercent: totalLogged ? Math.round((infradi / totalLogged) * 100) : 0,
    qazaCount: qaza,
    totalLogged,
    zikrToday,
    zikrKasratToday,
    zikrTotal30d,
    tilawatToday,
    tilawatTarget,
    hifazatToday,
    hifazatTarget: HIFAZAT_ITEMS.length + customHifazatCount,
  };
}
