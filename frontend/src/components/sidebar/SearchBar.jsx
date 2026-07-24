import { Search, X } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

export default function SearchBar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  return (
    <div className="relative">
      <Search size={14} className="absolute left-2.5 top-2.5 text-ink-faint pointer-events-none" />
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search customer, ID, city, owner"
        aria-label="Search relocations"
        className="w-full rounded-lg pl-8 pr-7 py-2 text-xs outline-none border border-border bg-surface focus:border-border-strong"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-2 text-ink-faint hover:text-ink"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
