import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { useRelocation, useUpdateChecklistItem, useDeleteRelocation } from "../hooks/useRelocations";
import { groupChecklist, blockedItems, stalledItems, currentStage, pctDone } from "../lib/checklistCalc";
import RouteLine from "../components/detail/RouteLine";
import ChecklistGroup from "../components/detail/ChecklistGroup";
import EscalationBanner from "../components/detail/EscalationBanner";
import UpdateParser from "../components/ai/UpdateParser";
import MessageDrafter from "../components/ai/MessageDrafter";
import { DetailSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { useUIStore } from "../store/useUIStore";

export default function RelocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: relocation, isLoading, isError, error } = useRelocation(id);
  const updateChecklistItem = useUpdateChecklistItem(id);
  const deleteRelocation = useDeleteRelocation();
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !relocation) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load this relocation"
        description={error?.message ?? "It may have been deleted."}
        action={
          <Link to="/" className="text-sm text-rust hover:underline">
            Back to dashboard
          </Link>
        }
      />
    );
  }

  const pct = pctDone(relocation.checklist);
  const stage = currentStage(relocation.checklist);
  const blocked = blockedItems(relocation.checklist);
  const stalled = stalledItems(relocation.checklist);
  const groups = groupChecklist(relocation.checklist);

  const handleStatusChange = (itemKey, status) => {
    updateChecklistItem.mutate({ itemKey, status, updatedBy: relocation.owner });
  };

  const handleDelete = () => {
    openConfirmDialog({
      title: "Delete this relocation?",
      message: `This removes ${relocation.customerName}'s record (${relocation.id}) permanently. This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        await deleteRelocation.mutateAsync(relocation.id);
        navigate("/");
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="md:hidden inline-flex items-center gap-1 text-xs text-ink-soft mb-4">
          <ArrowLeft size={13} /> Back to list
        </Link>

        <div className="flex items-start justify-between mb-1 gap-3">
          <div className="min-w-0">
            <div className="text-xs font-mono text-ink-faint">{relocation.id}</div>
            <h1 className="font-heading font-bold text-2xl text-ink truncate">{relocation.customerName}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full px-3 py-1.5 text-xs font-medium bg-rust-soft text-rust">{stage}</span>
            <button onClick={handleDelete} aria-label="Delete relocation" className="text-ink-faint hover:text-rust p-1">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="text-sm mb-5 text-ink-soft">
          Owner: {relocation.owner} · Move date:{" "}
          {new Date(relocation.moveDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
          {relocation.customerPhone && <> · {relocation.customerPhone}</>}
        </div>

        <div className="mb-6">
          <RouteLine origin={relocation.origin} dest={relocation.dest} pct={pct} />
        </div>

        <div className="mb-6">
          <EscalationBanner blocked={blocked} stalled={stalled} />
        </div>

        <div className="space-y-6 mb-6">
          {groups.map((g) => (
            <ChecklistGroup
              key={g.group}
              group={g.group}
              items={g.items}
              onStatusChange={handleStatusChange}
              disabled={updateChecklistItem.isPending}
            />
          ))}
        </div>

        <div className="space-y-4">
          <UpdateParser relocation={relocation} />
          <MessageDrafter relocation={relocation} />
        </div>
      </div>
    </div>
  );
}
