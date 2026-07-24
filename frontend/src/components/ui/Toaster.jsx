import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "../../store/useToastStore";

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };
const STYLES = {
  success: "bg-green text-white",
  error: "bg-rust text-white",
  info: "bg-ink text-white",
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant] ?? Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`rounded-lg px-4 py-2.5 text-xs font-medium flex items-center gap-2 shadow-lg ${STYLES[t.variant]}`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
