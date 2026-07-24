import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Check } from "lucide-react";
import { useEscalations, useAcknowledgeEscalation } from "../../hooks/useRelocations";
import { Skeleton } from "../ui/Skeleton";

export default function EscalationsPanel() {
  const { data: escalations, isLoading } = useEscalations();
  const acknowledge = useAcknowledgeEscalation();

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-heading font-semibold text-sm text-ink mb-3">Open escalations</h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && escalations?.length === 0 && (
        <p className="text-sm text-ink-faint">Nothing blocked or stalled right now — clean board.</p>
      )}

      <div className="space-y-1.5">
        {escalations?.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 border border-border bg-surface-sunken/50"
          >
            {e.type === "blocked" ? (
              <AlertTriangle size={14} className="text-rust shrink-0" />
            ) : (
              <Clock size={14} className="text-amber shrink-0" />
            )}
            <div className="flex-1 min-w-0 text-xs">
              <Link to={`/relocations/${e.relocationId}`} className="font-medium text-ink hover:underline">
                {e.customerName}
              </Link>
              <span className="text-ink-faint"> — {e.itemLabel} · {e.group}</span>
            </div>
            {!e.acknowledgedBy && (
              <button
                onClick={() => acknowledge.mutate(e.id)}
                title="Acknowledge"
                className="text-ink-faint hover:text-green shrink-0"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
