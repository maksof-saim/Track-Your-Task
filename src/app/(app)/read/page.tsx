import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

const surahs = [
  { name: "Surah Yaseen", file: "yaseen.pdf" },
  { name: "Surah Mulk", file: "mulk.pdf" },
  { name: "Surah Rehman", file: "rehman.pdf" },
  { name: "Surah Jummah", file: "jummah.pdf" },
  { name: "Surah Kahf", file: "kahf.pdf" },
  { name: "Surah Waqiah", file: "waqiah.pdf" },
];

export default async function ReadPage() {
  const t = getDictionary(await getLocale()).public.read;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        {surahs.map((surah) => (
          <div key={surah.file} className="rounded-xl border p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">{surah.name}</h2>
            <a href={`/quran-pdfs/${surah.file}`} target="_blank" rel="noopener noreferrer">
              <button className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white">
                {t.readNow}
              </button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
