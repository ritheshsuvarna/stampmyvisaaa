import { prisma } from "../db/client.js";

// City-specific template rows override the default (cityId = null) set.
// v1 seeds only the default template for every city, but this makes adding
// a Bengaluru-only item, say, a data change rather than a code change.
export async function resolveTemplateForCity(cityId) {
  const cityRows = await prisma.checklistTemplateItem.findMany({
    where: { cityId },
    orderBy: { sortOrder: "asc" },
  });
  if (cityRows.length > 0) return cityRows;

  return prisma.checklistTemplateItem.findMany({
    where: { cityId: null },
    orderBy: { sortOrder: "asc" },
  });
}
