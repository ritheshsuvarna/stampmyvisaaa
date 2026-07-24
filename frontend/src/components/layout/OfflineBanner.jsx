import { WifiOff } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

export default function OfflineBanner() {
  const isOffline = useUIStore((s) => s.isOffline);
  if (!isOffline) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-amber-soft text-amber-dark border-b border-border-strong">
      <WifiOff size={13} />
      Can't reach the server — working from local storage. Changes will stay on this device until it's back.
    </div>
  );
}
