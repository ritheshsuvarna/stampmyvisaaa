import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "../../store/useUIStore";
import Button from "./Button";

export default function ConfirmDialog() {
  const dialog = useUIStore((s) => s.confirmDialog);
  const close = useUIStore((s) => s.closeConfirmDialog);

  return (
    <AnimatePresence>
      {dialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-ink/45"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-2xl p-6 bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading font-semibold text-lg text-ink mb-1.5">{dialog.title}</h2>
            <p className="text-sm text-ink-soft mb-5">{dialog.message}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={close}>
                Cancel
              </Button>
              <Button
                variant={dialog.danger ? "danger" : "primary"}
                size="sm"
                onClick={() => {
                  dialog.onConfirm();
                  close();
                }}
              >
                {dialog.confirmLabel || "Confirm"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
