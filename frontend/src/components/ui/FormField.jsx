export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-ink-soft font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rust">{error}</p>}
    </div>
  );
}
