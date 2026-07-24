import { prisma } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { pctDone, blockedItems, stalledItems } from "../services/checklistCalc.js";

export const getSummary = asyncHandler(async (req, res) => {
  const relocations = await prisma.relocation.findMany({
    include: { checklistItems: true, originCity: true, destCity: true },
  });

  let active = 0;
  let completed = 0;
  let blocked = 0;
  let stalled = 0;
  const cycleTimes = [];
  const byCity = {};

  for (const r of relocations) {
    const pct = pctDone(r.checklistItems);
    const isComplete = r.status === "completed" || pct === 100;
    if (isComplete) {
      completed += 1;
      cycleTimes.push((new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / 86400000);
    } else if (r.status === "active") {
      active += 1;
    }
    if (blockedItems(r.checklistItems).length > 0) blocked += 1;
    if (stalledItems(r.checklistItems).length > 0) stalled += 1;

    const cityName = r.destCity.name;
    byCity[cityName] = (byCity[cityName] || 0) + 1;
  }

  res.json({
    data: {
      total: relocations.length,
      active,
      completed,
      blocked,
      stalled,
      avgCycleTimeDays: cycleTimes.length ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10 : null,
      byDestCity: byCity,
    },
  });
});
