import { PrismaClient } from "@prisma/client";
import { CITIES, OPS_TEAM, ALL_TEMPLATE_ITEMS } from "../src/config/checklistTemplate.js";

const prisma = new PrismaClient();

async function main() {
  for (const name of CITIES) {
    await prisma.city.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const name of OPS_TEAM) {
    await prisma.opsUser.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const item of ALL_TEMPLATE_ITEMS) {
    const existing = await prisma.checklistTemplateItem.findFirst({
      where: { cityId: null, itemKey: item.key },
    });
    if (existing) {
      await prisma.checklistTemplateItem.update({
        where: { id: existing.id },
        data: { groupName: item.group, label: item.label, sortOrder: item.sortOrder },
      });
    } else {
      await prisma.checklistTemplateItem.create({
        data: {
          cityId: null,
          itemKey: item.key,
          groupName: item.group,
          label: item.label,
          sortOrder: item.sortOrder,
        },
      });
    }
  }

  console.log(`Seeded ${CITIES.length} cities, ${OPS_TEAM.length} ops users, ${ALL_TEMPLATE_ITEMS.length} template items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
