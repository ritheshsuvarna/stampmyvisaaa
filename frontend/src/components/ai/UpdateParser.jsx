import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useParseUpdate } from "../../hooks/useAi";
import { useApplySuggestions } from "../../hooks/useRelocations";
import { STATUS_META } from "../../lib/checklistTemplate";
import Button from "../ui/Button";

export default function UpdateParser({ relocation }) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [checked, setChecked] = useState({});

  const parseUpdate = useParseUpdate(relocation.id);
  const applySuggestions = useApplySuggestions(relocation.id);

  const labelFor = (key) => relocation.checklist.find((i) => i.key === key)?.label ?? key;

  const handleParse = async () => {
    if (!text.trim()) return;
    setSuggestions(null);
    try {
      const result = await parseUpdate.mutateAsync(text);
      setSuggestions(result);
      setChecked(Object.fromEntries(result.map((_, i) => [i, true])));
    } catch {
      // error surfaced via parseUpdate.error below
    }
  };

  const handleApply = async () => {
    const toApply = suggestions.filter((_, i) => checked[i]);
    if (toApply.length === 0) return;
    await applySuggestions.mutateAsync({ suggestions: toApply, updatedBy: relocation.owner });
    setSuggestions(null);
    setText("");
  };

  return (
    <div className="rounded-xl p-4 border border-border bg-surface-sunken">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-rust" />
        <span className="text-xs font-medium text-ink">Paste a WhatsApp update</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. lease signed today, movers still haven't confirmed for the 14th, electricity connection is done"
        rows={3}
        maxLength={4000}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none border border-border bg-surface focus:border-border-strong"
      />
      <Button size="sm" onClick={handleParse} disabled={parseUpdate.isPending || !text.trim()} className="mt-2">
        {parseUpdate.isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {parseUpdate.isPending ? "Reading update…" : "Parse into checklist changes"}
      </Button>

      {parseUpdate.isError && <p className="mt-2 text-xs text-rust">{parseUpdate.error.message}</p>}

      {suggestions && (
        <div className="mt-3 space-y-2">
          {suggestions.length === 0 && (
            <p className="text-xs text-ink-faint">No clear checklist changes found in that note.</p>
          )}
          {suggestions.map((s, i) => (
            <label key={i} className="flex items-start gap-2 text-xs rounded-lg p-2 border border-border bg-surface">
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })}
                className="mt-0.5"
              />
              <span>
                <b>{labelFor(s.key)}</b> → <span style={{ color: STATUS_META[s.status]?.color }}>{STATUS_META[s.status]?.label}</span>
                {s.note && <span className="text-ink-faint"> — {s.note}</span>}
              </span>
            </label>
          ))}
          {suggestions.length > 0 && (
            <Button
              size="sm"
              variant="success"
              onClick={handleApply}
              disabled={applySuggestions.isPending || Object.values(checked).every((v) => !v)}
            >
              {applySuggestions.isPending ? "Applying…" : "Apply selected changes"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
