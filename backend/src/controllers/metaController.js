import { prisma } from "../db/client.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listCities = asyncHandler(async (req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  res.json({ data: cities.map((c) => c.name) });
});

export const listOpsUsers = asyncHandler(async (req, res) => {
  const users = await prisma.opsUser.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  res.json({ data: users.map((u) => u.name) });
});
