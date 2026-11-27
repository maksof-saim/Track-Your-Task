import ChecklistPage from "@/components/ChecklistPage";
import { TILAWAT_ITEMS } from "@/lib/checklistMeta";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function TilawatPage() {
  const t = getDictionary(await getLocale());
  return (
    <ChecklistPage
      title={t.tilawat.title}
      subtitle={t.tilawat.subtitle}
      section="TILAWAT"
      items={TILAWAT_ITEMS}
    />
  );
}
