import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import RelocationListItem from "./RelocationListItem";
import { SidebarSkeleton } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { useRelocations } from "../../hooks/useRelocations";
import { useUIStore } from "../../store/useUIStore";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function Sidebar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const activeFilter = useUIStore((s) => s.activeFilter);
  const openAddModal = useUIStore((s) => s.openAddModal);
  const location = useLocation();
  const navigate = useNavigate();

  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const { data: relocations, isLoading, isError } = useRelocations(debouncedQuery, activeFilter);

  const isDetailRoute = location.pathname.startsWith("/relocations/");
  const visibilityClass = isDetailRoute ? "hidden md:flex" : "flex";

  return (
    <div className={`${visibilityClass} w-full md:w-80 flex-shrink-0 flex-col border-r border-border bg-bg h-full`}>
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-ink-faint tracking-wide">QUICKMOVE</div>
            <h1 className="font-heading font-bold text-lg text-ink">Relocation manifest</h1>
          </div>
          <button
            onClick={() => {
              navigate("/");
              openAddModal();
            }}
            aria-label="Add relocation"
            className="rounded-full p-2 bg-ink hover:opacity-90 transition"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>
        <SearchBar />
        <FilterChips />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <SidebarSkeleton />}
        {isError && (
          <EmptyState title="Couldn't load relocations" description="Check your connection and try refreshing." />
        )}
        {!isLoading && !isError && relocations?.length === 0 && (
          <EmptyState
            title={searchQuery || activeFilter !== "all" ? "No matches" : "No relocations yet"}
            description={
              searchQuery || activeFilter !== "all"
                ? "Try a different search or filter."
                : "Add your first move to start tracking it."
            }
          />
        )}
        {!isLoading &&
          relocations?.map((r) => <RelocationListItem key={r.id} reloc={r} />)}
      </div>
    </div>
  );
}
