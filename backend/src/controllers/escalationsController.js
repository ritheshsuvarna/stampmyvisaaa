import { prisma } from "../db/client.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";
import { sweepStalledEscalations } from "../services/escalationService.js";

export const listEscalations = asyncHandler(async (req, res) => {
  await sweepStalledEscalations();

  const escalations = await prisma.escalation.findMany({
    where: { resolvedAt: null },
    include: {
      relocation: { select: { id: true, customerName: true } },
      checklistItem: { select: { label: true, groupName: true, updatedAt: true } },
    },
    orderBy: { openedAt: "asc" },
  });

  res.json({
    data: escalations.map((e) => ({
      id: e.id,
      relocationId: e.relocationId,
      customerName: e.relocation.customerName,
      type: e.type,
      itemLabel: e.checklistItem?.label ?? null,
      group: e.checklistItem?.groupName ?? null,
      openedAt: e.openedAt,
      acknowledgedBy: e.acknowledgedBy,
    })),
  });
});

export const acknowledgeEscalation = asyncHandler(async (req, res) => {
  const { by } = req.body;
  const escalation = await prisma.escalation
    .update({ where: { id: req.params.id }, data: { acknowledgedBy: by ?? "ops" } })
    .catch(() => null);
  if (!escalation) throw new ApiError(404, "Escalation not found", "not_found");
  res.json({ data: escalation });
});
