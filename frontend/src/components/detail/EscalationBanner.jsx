import { AlertTriangle, Clock } from "lucide-react";

export default function EscalationBanner({ blocked, stalled }) {
  if (blocked.length === 0 && stalled.length === 0) return null;

  return (
    <div className="rounded-xl p-3 space-y-1.5 border border-border-strong bg-amber-soft">
      {blocked.map((i) => (
        <div key={i.key} className="flex items-center gap-2 text-xs text-rust">
          <AlertTriangle size={13} className="shrink-0" /> Blocked: {i.label}
          {i.note && <span className="text-ink-faint"> — {i.note}</span>}
        </div>
      ))}
      {stalled.map((i) => (
        <div key={i.key} className="flex items-center gap-2 text-xs text-amber-dark">
          <Clock size={13} className="shrink-0" /> No update on "{i.label}" in {i.daysSinceUpdate} days
        </div>
      ))}
    </div>
  );
}
