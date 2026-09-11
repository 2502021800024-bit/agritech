import type { ColdStorage, Crop, Lang, Location, TranslationDict } from '@/types';
import StorageCard from './StorageCard';

interface StorageListProps {
  t: TranslationDict;
  lang: Lang;
  storages: ColdStorage[];
  selectedCrop: Crop;
  selectedLocation: Location;
  setSelectedLocation: (loc: Location) => void;
  locations: Location[];
  bagQuantity: number;
  durationMonths: number;
  needTransport: boolean;
  filterTab: string;
  setFilterTab: (tab: string) => void;
  onBook: (storage: ColdStorage) => void;
}

export default function StorageList({
  t,
  lang,
  storages,
  selectedCrop,
  selectedLocation,
  setSelectedLocation,
  locations,
  bagQuantity,
  durationMonths,
  needTransport,
  filterTab,
  setFilterTab,
  onBook,
}: StorageListProps) {
  const filters: { key: string; label: string }[] = [
    { key: 'all', label: '⭐ All Verified' },
    { key: 'closest', label: '📍 Nearest First (<5 km)' },
    { key: 'cheapest', label: '💰 Lowest Price' },
  ];

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-7 h-7 bg-farm-100 text-farm-700 rounded-lg flex items-center justify-center font-black text-sm">
            3
          </span>
          {t.selectLoc}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">📍 District:</span>
          <select
            value={selectedLocation.id}
            onChange={(e) => setSelectedLocation(locations.find((l) => l.id === e.target.value)!)}
            className="bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:ring-2 focus:ring-farm-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter:</span>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterTab(f.key)}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              filterTab === f.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Storage Cards */}
      <div className="space-y-4">
        {storages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-bold">No cold storage facilities found for this district.</p>
          </div>
        ) : (
          storages.map((storage) => (
            <StorageCard
              key={storage.id}
              storage={storage}
              t={t}
              lang={lang}
              selectedCrop={selectedCrop}
              bagQuantity={bagQuantity}
              durationMonths={durationMonths}
              needTransport={needTransport}
              onBook={onBook}
            />
          ))
        )}
      </div>
    </section>
  );
}
