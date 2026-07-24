export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        {Icon && <Icon size={28} className="mx-auto mb-3 text-ink-faint" />}
        {title && <p className="text-sm font-medium text-ink mb-1">{title}</p>}
        {description && <p className="text-sm text-ink-faint">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
