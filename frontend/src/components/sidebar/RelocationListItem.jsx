import { NavLink } from "react-router-dom";
import { ChevronRight, CircleDot } from "lucide-react";

export default function RelocationListItem({ reloc }) {
  return (
    <NavLink
      to={`/relocations/${reloc.id}`}
      className={({ isActive }) =>
        `w-full text-left px-5 py-3 flex items-center gap-3 border-b border-border transition ${
          isActive ? "bg-surface-sunken" : "hover:bg-surface-sunken/60"
        }`
      }
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate text-ink">{reloc.customerName}</span>
          {reloc.blockedCount > 0 && <CircleDot size={10} className="text-rust shrink-0" />}
          {reloc.blockedCount === 0 && reloc.stalledCount > 0 && <CircleDot size={10} className="text-amber shrink-0" />}
        </div>
        <div className="text-xs flex items-center gap-1 font-mono text-ink-faint">
          {reloc.origin.slice(0, 3).toUpperCase()} → {reloc.dest.slice(0, 3).toUpperCase()} · {reloc.pct}% · {reloc.owner}
        </div>
      </div>
      <ChevronRight size={14} className="text-ink-faint shrink-0" />
    </NavLink>
  );
}
