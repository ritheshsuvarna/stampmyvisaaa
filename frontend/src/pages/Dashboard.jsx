import { MapPin, Plus } from "lucide-react";
import SummaryCards from "../components/dashboard/SummaryCards";
import EscalationsPanel from "../components/dashboard/EscalationsPanel";
import { useUIStore } from "../store/useUIStore";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const openAddModal = useUIStore((s) => s.openAddModal);

  return (
    <div className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-ink">Operations dashboard</h1>
          <p className="text-sm text-ink-faint mt-0.5">Every relocation in flight, at a glance.</p>
        </div>
        <Button onClick={openAddModal} className="hidden sm:inline-flex">
          <Plus size={15} /> New relocation
        </Button>
      </div>

      <SummaryCards />
      <EscalationsPanel />

      <div className="rounded-xl border border-dashed border-border-strong p-8 text-center">
        <MapPin size={24} className="mx-auto mb-2 text-ink-faint" />
        <p className="text-sm text-ink-faint">Select a relocation on the left, or add a new one to start tracking it.</p>
      </div>
    </div>
  );
}
