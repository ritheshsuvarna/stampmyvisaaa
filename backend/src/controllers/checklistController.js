import { prisma } from "../db/client.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";
import { updateChecklistItemSchema, applySuggestionsSchema } from "../validation/schemas.js";
import { syncBlockedEscalation } from "../services/escalationService.js";
import { serializeRelocation, relocationInclude } from "./relocationsController.js";

async function applyOne(relocationId, itemKey, status, note, updatedBy, source) {
  const item = await prisma.checklistItem.findUnique({
    where: { relocationId_itemKey: { relocationId, itemKey } },
  });
  if (!item) throw new ApiError(404, `Unknown checklist item "${itemKey}" for this relocation`, "not_found");

  const updated = await prisma.checklistItem.update({
    where: { id: item.id },
    data: {
      status,
      note: note ?? item.note,
      updatedBy: updatedBy ?? item.updatedBy,
      history: {
        create: { oldStatus: item.status, newStatus: status, note: note ?? "", changedBy: updatedBy, source },
      },
    },
  });

  await syncBlockedEscalation(updated, updatedBy);
  return updated;
}

export const updateChecklistItem = asyncHandler(async (req, res) => {
  const { id, itemKey } = req.params;
  const parsed = updateChecklistItemSchema.parse(req.body);

  await applyOne(id, itemKey, parsed.status, parsed.note, parsed.updatedBy, "manual");

  const relocation = await prisma.relocation.findUnique({ where: { id }, include: relocationInclude });
  res.json({ data: serializeRelocation(relocation) });
});

export const applySuggestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parsed = applySuggestionsSchema.parse(req.body);

  for (const s of parsed.suggestions) {
    await applyOne(id, s.key, s.status, s.note, parsed.updatedBy, "ai_parsed");
  }

  const relocation = await prisma.relocation.findUnique({ where: { id }, include: relocationInclude });
  if (!relocation) throw new ApiError(404, "Relocation not found", "not_found");
  res.json({ data: serializeRelocation(relocation) });
});
