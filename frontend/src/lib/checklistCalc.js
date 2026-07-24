import { GROUP_ORDER, STALE_DAYS } from "./checklistTemplate";

export function daysSince(date) {
  return (Date.now() - new Date(date).getTime()) / 86400000;
}

export function pctDone(checklist) {
  if (!checklist?.length) return 0;
  const done = checklist.filter((i) => i.status === "done").length;
  return Math.round((done / checklist.length) * 100);
}

export function currentStage(checklist) {
  for (const group of GROUP_ORDER) {
    const groupItems = checklist.filter((i) => i.group === group);
    const allDone = groupItems.length > 0 && groupItems.every((i) => i.status === "done");
    if (!allDone) return group;
  }
  return "Complete";
}

export function stalledItems(checklist, staleDays = STALE_DAYS) {
  return checklist.filter((i) => i.status !== "done" && i.status !== "blocked" && daysSince(i.updatedAt) > staleDays);
}

export function blockedItems(checklist) {
  return checklist.filter((i) => i.status === "blocked");
}

export function groupChecklist(checklist) {
  return GROUP_ORDER.map((group) => ({
    group,
    items: checklist.filter((i) => i.group === group),
  }));
}
