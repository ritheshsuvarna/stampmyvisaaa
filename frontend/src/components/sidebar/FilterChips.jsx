import { useUIStore } from "../../store/useUIStore";

const FILTERS = [
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "blocked", label: "Blocked" },
  { key: "stalled", label: "Stalled" },
  { key: "completed", label: "Completed" },
];

export default function FilterChips() {
  const activeFilter = useUIStore((s) => s.activeFilter);
  const setActiveFilter = useUIStore((s) => s.setActiveFilter);

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
              isActive ? "bg-ink text-white border-ink" : "bg-surface text-ink-soft border-border hover:border-border-strong"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
