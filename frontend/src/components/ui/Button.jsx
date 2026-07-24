const VARIANTS = {
  primary: "bg-ink text-white hover:opacity-90",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-sunken",
  success: "bg-green text-white hover:opacity-90",
  danger: "bg-rust text-white hover:opacity-90",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
};

export default function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${sizeCls} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
