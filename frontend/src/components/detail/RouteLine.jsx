import { motion } from "framer-motion";

export default function RouteLine({ origin, dest, pct }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 font-mono text-[11px] text-ink-soft">
        <span>{origin.toUpperCase()}</span>
        <span>{dest.toUpperCase()}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-soft">
        <motion.div
          className="absolute left-0 top-0 h-1.5 rounded-full bg-rust"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
        <motion.div
          className="absolute top-1/2 rounded-full border-2 border-rust bg-surface"
          style={{ width: 12, height: 12 }}
          initial={{ left: 0, y: "-50%", x: "-50%" }}
          animate={{ left: `${pct}%`, y: "-50%", x: "-50%" }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  );
}
