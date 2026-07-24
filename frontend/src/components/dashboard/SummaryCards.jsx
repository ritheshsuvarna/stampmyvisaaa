import { motion } from "framer-motion";
import { Package, Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useAnalyticsSummary } from "../../hooks/useRelocations";
import { Skeleton } from "../ui/Skeleton";

const CARDS = [
  { key: "total", label: "Total relocations", icon: Package, tone: "ink" },
  { key: "active", label: "Active", icon: Activity, tone: "blue" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "green" },
  { key: "blocked", label: "Blocked", icon: AlertTriangle, tone: "rust" },
  { key: "stalled", label: "Stalled", icon: Clock, tone: "amber" },
];

const TONE_CLASSES = {
  ink: "bg-surface-sunken text-ink",
  blue: "bg-blue-soft text-blue",
  green: "bg-green-soft text-green",
  rust: "bg-rust-soft text-rust",
  amber: "bg-amber-soft text-amber-dark",
};

export default function SummaryCards() {
  const { data, isLoading } = useAnalyticsSummary();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <div className={`inline-flex items-center justify-center rounded-lg w-8 h-8 mb-3 ${TONE_CLASSES[card.tone]}`}>
            <card.icon size={16} />
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <div className="font-heading font-bold text-2xl text-ink">{data?.[card.key] ?? 0}</div>
          )}
          <div className="text-xs text-ink-faint">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
