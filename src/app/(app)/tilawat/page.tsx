import ChecklistPage from "@/components/ChecklistPage";
import { TILAWAT_ITEMS } from "@/lib/checklistMeta";

export default function TilawatPage() {
  return (
    <ChecklistPage
      title="Tilawat"
      subtitle="Aaj ki Quran tilawat aur muqarrar suraton ka record"
      section="TILAWAT"
      items={TILAWAT_ITEMS}
    />
  );
}
