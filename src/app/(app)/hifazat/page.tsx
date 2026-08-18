import ChecklistPage from "@/components/ChecklistPage";
import { HIFAZAT_ITEMS } from "@/lib/checklistMeta";

export default function HifazatPage() {
  return (
    <ChecklistPage
      title="Hifazat"
      subtitle="Nazar, kaan aur zaban ki hifazat ka roz ka jaiza"
      section="HIFAZAT"
      items={HIFAZAT_ITEMS}
    />
  );
}
