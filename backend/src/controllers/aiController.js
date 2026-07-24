import { prisma } from "../db/client.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";
import { parseUpdateSchema } from "../validation/schemas.js";
import { parseUpdateToSuggestions, draftCustomerMessage, AiParseError } from "../services/aiService.js";
import { GROUP_ORDER } from "../config/checklistTemplate.js";

async function loadRelocationWithItems(id) {
  const relocation = await prisma.relocation.findUnique({
    where: { id },
    include: { originCity: true, destCity: true, opsOwner: true, checklistItems: true },
  });
  if (!relocation) throw new ApiError(404, "Relocation not found", "not_found");
  return relocation;
}

export const parseUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = parseUpdateSchema.parse(req.body);
  const relocation = await loadRelocationWithItems(id);

  let suggestions = [];
  let error = null;

  try {
    suggestions = await parseUpdateToSuggestions(relocation.checklistItems, text);
  } catch (e) {
    if (e instanceof AiParseError) {
      error = "Couldn't parse that update. Try rephrasing, or update the checklist directly.";
      await prisma.aiUpdateLog.create({
        data: { relocationId: id, rawText: text, aiResponse: e.raw ?? "", applied: false, error },
      });
      return res.status(502).json({ error: { message: error, code: "ai_parse_error" } });
    }
    throw e;
  }

  await prisma.aiUpdateLog.create({
    data: { relocationId: id, rawText: text, aiResponse: JSON.stringify(suggestions), applied: false },
  });

  res.json({ data: { suggestions } });
});

export const draftMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const relocation = await loadRelocationWithItems(id);

  const byGroup = GROUP_ORDER.map((group) => {
    const items = relocation.checklistItems.filter((i) => i.groupName === group);
    const summary = items.map((i) => `${i.label}: ${i.status.replace("_", " ")}`).join("; ");
    return `${group} — ${summary}`;
  }).join("\n");

  const text = await draftCustomerMessage(
    {
      customerName: relocation.customerName,
      originCity: relocation.originCity.name,
      destCity: relocation.destCity.name,
      moveDate: new Date(relocation.moveDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
    },
    byGroup
  );

  await prisma.customerMessage.create({ data: { relocationId: id, generatedText: text } });

  res.json({ data: { message: text } });
});
