import ChecklistPage from "@/components/ChecklistPage";
import { HIFAZAT_ITEMS } from "@/lib/checklistMeta";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

export default async function HifazatPage() {
  const t = getDictionary(await getLocale());
  return (
    <ChecklistPage
      title={t.hifazat.title}
      subtitle={t.hifazat.subtitle}
      section="HIFAZAT"
      items={HIFAZAT_ITEMS}
    />
  );
}
