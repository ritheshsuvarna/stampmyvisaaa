import { prisma } from "../db/client.js";
import { ApiError, asyncHandler } from "../middleware/errorHandler.js";
import { createRelocationSchema } from "../validation/schemas.js";
import { resolveTemplateForCity } from "../services/templateService.js";
import { pctDone, currentStage, stalledItems, blockedItems, makeRelocationId, daysSince } from "../services/checklistCalc.js";

function serialize(relocation) {
  const items = relocation.checklistItems;
  const stalled = stalledItems(items);
  const blocked = blockedItems(items);
  return {
    id: relocation.id,
    customerName: relocation.customerName,
    customerPhone: relocation.customerPhone,
    origin: relocation.originCity.name,
    dest: relocation.destCity.name,
    moveDate: relocation.moveDate,
    owner: relocation.opsOwner.name,
    status: relocation.status,
    createdAt: relocation.createdAt,
    updatedAt: relocation.updatedAt,
    pct: pctDone(items),
    stage: currentStage(items),
    blockedCount: blocked.length,
    stalledCount: stalled.length,
    checklist: items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        key: i.itemKey,
        group: i.groupName,
        label: i.label,
        status: i.status,
        note: i.note,
        updatedAt: i.updatedAt,
        updatedBy: i.updatedBy,
        daysSinceUpdate: Math.floor(daysSince(i.updatedAt)),
      })),
  };
}

const include = {
  originCity: true,
  destCity: true,
  opsOwner: true,
  checklistItems: true,
};

export const listRelocations = asyncHandler(async (req, res) => {
  const { q, filter } = req.query;

  const relocations = await prisma.relocation.findMany({
    include,
    orderBy: { createdAt: "desc" },
  });

  let results = relocations.map(serialize);

  if (q) {
    const needle = String(q).toLowerCase();
    results = results.filter(
      (r) =>
        r.customerName.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        r.origin.toLowerCase().includes(needle) ||
        r.dest.toLowerCase().includes(needle) ||
        r.owner.toLowerCase().includes(needle)
    );
  }

  if (filter && filter !== "all") {
    const now = Date.now();
    const upcomingWindowMs = 7 * 86400000;
    results = results.filter((r) => {
      switch (filter) {
        case "blocked":
          return r.blockedCount > 0;
        case "stalled":
          return r.stalledCount > 0;
        case "active":
          return r.status === "active";
        case "completed":
          return r.status === "completed" || r.pct === 100;
        case "upcoming":
          return r.status === "active" && new Date(r.moveDate).getTime() - now < upcomingWindowMs && new Date(r.moveDate).getTime() > now;
        default:
          return true;
      }
    });
  }

  res.json({ data: results });
});

export const getRelocation = asyncHandler(async (req, res) => {
  const relocation = await prisma.relocation.findUnique({ where: { id: req.params.id }, include });
  if (!relocation) throw new ApiError(404, "Relocation not found", "not_found");
  res.json({ data: serialize(relocation) });
});

export const createRelocation = asyncHandler(async (req, res) => {
  const parsed = createRelocationSchema.parse(req.body);

  const moveDate = new Date(parsed.moveDate);
  if (moveDate.getTime() < Date.now() - 86400000) {
    throw new ApiError(400, "Move date can't be in the past", "invalid_move_date");
  }

  const [originCity, destCity, opsOwner] = await Promise.all([
    prisma.city.findUnique({ where: { name: parsed.originCity } }),
    prisma.city.findUnique({ where: { name: parsed.destCity } }),
    prisma.opsUser.findUnique({ where: { name: parsed.opsOwner } }),
  ]);
  if (!originCity) throw new ApiError(400, "Unknown origin city", "invalid_city");
  if (!destCity) throw new ApiError(400, "Unknown destination city", "invalid_city");
  if (!opsOwner) throw new ApiError(400, "Unknown ops owner", "invalid_owner");

  const duplicate = await prisma.relocation.findFirst({
    where: {
      customerName: { equals: parsed.customerName },
      moveDate,
      status: { not: "cancelled" },
    },
  });
  if (duplicate) {
    throw new ApiError(409, `${parsed.customerName} already has a relocation (${duplicate.id}) on this date.`, "duplicate_relocation");
  }

  const now = new Date();
  const monthPrefix = `QM-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const countThisMonth = await prisma.relocation.count({ where: { id: { startsWith: monthPrefix } } });
  const id = makeRelocationId(countThisMonth);

  const templateItems = await resolveTemplateForCity(destCity.id);

  const relocation = await prisma.relocation.create({
    data: {
      id,
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone || null,
      originCityId: originCity.id,
      destCityId: destCity.id,
      moveDate,
      opsOwnerId: opsOwner.id,
      checklistItems: {
        create: templateItems.map((t) => ({
          itemKey: t.itemKey,
          groupName: t.groupName,
          label: t.label,
          sortOrder: t.sortOrder,
        })),
      },
    },
    include,
  });

  res.status(201).json({ data: serialize(relocation) });
});

export const updateRelocation = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, status } = req.body;
  const data = {};
  if (customerName !== undefined) data.customerName = customerName;
  if (customerPhone !== undefined) data.customerPhone = customerPhone;
  if (status !== undefined) {
    if (!["active", "completed", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status value", "invalid_status");
    }
    data.status = status;
  }

  const relocation = await prisma.relocation
    .update({ where: { id: req.params.id }, data, include })
    .catch(() => null);
  if (!relocation) throw new ApiError(404, "Relocation not found", "not_found");

  res.json({ data: serialize(relocation) });
});

export const deleteRelocation = asyncHandler(async (req, res) => {
  await prisma.relocation.delete({ where: { id: req.params.id } }).catch(() => {
    throw new ApiError(404, "Relocation not found", "not_found");
  });
  res.status(204).send();
});

export { serialize as serializeRelocation, include as relocationInclude };
