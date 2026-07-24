import { prisma } from "../db/client.js";
import { daysSince } from "./checklistCalc.js";
import { STALE_DAYS } from "../config/checklistTemplate.js";

// Recomputes escalation rows for one checklist item after a status change:
// opens a "blocked" escalation if the new status is blocked, resolves any
// open one otherwise. Stalled escalations are swept separately (they're a
// function of time, not a single edit) via sweepStalledEscalations.
export async function syncBlockedEscalation(checklistItem, changedBy) {
  const openBlocked = await prisma.escalation.findFirst({
    where: { checklistItemId: checklistItem.id, type: "blocked", resolvedAt: null },
  });

  if (checklistItem.status === "blocked" && !openBlocked) {
    await prisma.escalation.create({
      data: {
        relocationId: checklistItem.relocationId,
        checklistItemId: checklistItem.id,
        type: "blocked",
      },
    });
  } else if (checklistItem.status !== "blocked" && openBlocked) {
    await prisma.escalation.update({
      where: { id: openBlocked.id },
      data: { resolvedAt: new Date(), acknowledgedBy: changedBy ?? openBlocked.acknowledgedBy },
    });
  }
}

// Opens/resolves "stalled" escalations across all active relocations.
// Call on read of the escalations list so the dashboard is always fresh
// without needing a background cron for this assignment's scope.
export async function sweepStalledEscalations() {
  const items = await prisma.checklistItem.findMany({
    where: { relocation: { status: "active" } },
    include: { escalations: { where: { type: "stalled", resolvedAt: null } } },
  });

  for (const item of items) {
    const isStale = item.status !== "done" && item.status !== "blocked" && daysSince(item.updatedAt) > STALE_DAYS;
    const openStalled = item.escalations[0];

    if (isStale && !openStalled) {
      await prisma.escalation.create({
        data: { relocationId: item.relocationId, checklistItemId: item.id, type: "stalled" },
      });
    } else if (!isStale && openStalled) {
      await prisma.escalation.update({
        where: { id: openStalled.id },
        data: { resolvedAt: new Date() },
      });
    }
  }
}
