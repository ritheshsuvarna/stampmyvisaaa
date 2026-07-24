import { motion } from "framer-motion";
import StatusPill from "./StatusPill";

export default function ChecklistGroup({ group, items, onStatusChange, disabled }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide mb-2 text-ink-faint">{group}</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <motion.div
            key={item.key}
            layout
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 border border-border bg-surface"
          >
            <div className="min-w-0">
              <span className="text-sm text-ink">{item.label}</span>
              {item.note && <p className="text-xs text-ink-faint truncate mt-0.5">{item.note}</p>}
            </div>
            <StatusPill status={item.status} disabled={disabled} onChange={(status) => onStatusChange(item.key, status)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
