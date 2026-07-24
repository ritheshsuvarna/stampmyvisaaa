import { useState } from "react";
import { Sparkles, Loader2, RotateCcw, Copy, Check } from "lucide-react";
import { useDraftMessage } from "../../hooks/useAi";
import Button from "../ui/Button";

export default function MessageDrafter({ relocation }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const draftMessage = useDraftMessage(relocation.id);

  const draft = async () => {
    setCopied(false);
    try {
      const text = await draftMessage.mutateAsync();
      setMessage(text);
    } catch {
      // error surfaced via draftMessage.error below
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl p-4 border border-border bg-surface-sunken">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-rust" />
          <span className="text-xs font-medium text-ink">Draft a customer update</span>
        </div>
        <Button size="sm" onClick={draft} disabled={draftMessage.isPending}>
          {draftMessage.isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
          {message ? "Redraft" : "Draft message"}
        </Button>
      </div>

      {draftMessage.isError && <p className="text-xs text-rust">{draftMessage.error.message}</p>}

      {message && (
        <div className="mt-1">
          <p className="text-sm rounded-lg p-3 border border-border bg-surface text-ink whitespace-pre-wrap">{message}</p>
          <button onClick={copy} className="mt-2 inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}
