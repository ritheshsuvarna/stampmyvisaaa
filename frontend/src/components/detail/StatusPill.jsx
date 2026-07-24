import { useState, useRef, useEffect } from "react";
import { STATUSES, STATUS_META } from "../../lib/checklistTemplate";

export default function StatusPill({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const meta = STATUS_META[status];

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-50"
        style={{ background: meta.soft, color: meta.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
        {meta.label}
      </button>
      {open && (
        <div className="absolute z-20 right-0 mt-1 rounded-lg shadow-lg overflow-hidden border border-border bg-surface min-w-[140px]">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-surface-sunken ${
                s === status ? "bg-surface-sunken" : ""
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[s].color }} />
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
