const surahs = [
    { name: "Surah Yaseen", file: "yaseen.pdf" },
    { name: "Surah Mulk", file: "mulk.pdf" },
    { name: "Surah Rehman", file: "rehman.pdf" },
    { name: "Surah Jummah", file: "jummah.pdf" },
    { name: "Surah Kahf", file: "kahf.pdf" },
    { name: "Surah Waqiah", file: "waqiah.pdf" },
];

export default function ReadPage() {
    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
                {surahs.map((surah) => (
                    <div key={surah.file} className="border rounded-xl p-4 shadow-sm">
                        <h2 className="font-semibold mb-2">{surah.name}</h2>
                        <a href={`/quran-pdfs/${surah.file}`} target="_blank">
                            <button className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">
                                Read Now
                            </button>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}