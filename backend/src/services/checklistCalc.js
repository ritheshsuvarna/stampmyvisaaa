import { GROUP_ORDER, STALE_DAYS } from "../config/checklistTemplate.js";

export function daysSince(date) {
  return (Date.now() - new Date(date).getTime()) / 86400000;
}

export function pctDone(checklistItems) {
  if (!checklistItems.length) return 0;
  const done = checklistItems.filter((i) => i.status === "done").length;
  return Math.round((done / checklistItems.length) * 100);
}

export function currentStage(checklistItems) {
  for (const group of GROUP_ORDER) {
    const groupItems = checklistItems.filter((i) => i.groupName === group);
    const allDone = groupItems.length > 0 && groupItems.every((i) => i.status === "done");
    if (!allDone) return group;
  }
  return "Complete";
}

export function stalledItems(checklistItems, staleDays = STALE_DAYS) {
  return checklistItems.filter(
    (i) => i.status !== "done" && i.status !== "blocked" && daysSince(i.updatedAt) > staleDays
  );
}

export function blockedItems(checklistItems) {
  return checklistItems.filter((i) => i.status === "blocked");
}

export function makeRelocationId(existingCountThisMonth) {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `QM-${yy}${mm}-${String(existingCountThisMonth + 1).padStart(4, "0")}`;
}
