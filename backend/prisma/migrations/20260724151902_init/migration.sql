-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OpsUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChecklistTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityId" TEXT,
    "groupName" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChecklistTemplateItem_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "originCityId" TEXT NOT NULL,
    "destCityId" TEXT NOT NULL,
    "moveDate" DATETIME NOT NULL,
    "opsOwnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Relocation_originCityId_fkey" FOREIGN KEY ("originCityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relocation_destCityId_fkey" FOREIGN KEY ("destCityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relocation_opsOwnerId_fkey" FOREIGN KEY ("opsOwnerId") REFERENCES "OpsUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relocationId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "note" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "ChecklistItem_relocationId_fkey" FOREIGN KEY ("relocationId") REFERENCES "Relocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistItemHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistItemId" TEXT NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChecklistItemHistory_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiUpdateLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relocationId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiUpdateLog_relocationId_fkey" FOREIGN KEY ("relocationId") REFERENCES "Relocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relocationId" TEXT NOT NULL,
    "generatedText" TEXT NOT NULL,
    "editedText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerMessage_relocationId_fkey" FOREIGN KEY ("relocationId") REFERENCES "Relocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Escalation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relocationId" TEXT NOT NULL,
    "checklistItemId" TEXT,
    "type" TEXT NOT NULL,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "acknowledgedBy" TEXT,
    CONSTRAINT "Escalation_relocationId_fkey" FOREIGN KEY ("relocationId") REFERENCES "Relocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Escalation_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OpsUser_name_key" ON "OpsUser"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTemplateItem_cityId_itemKey_key" ON "ChecklistTemplateItem"("cityId", "itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_relocationId_itemKey_key" ON "ChecklistItem"("relocationId", "itemKey");

-- CreateIndex
CREATE INDEX "Escalation_relocationId_idx" ON "Escalation"("relocationId");

-- CreateIndex
CREATE INDEX "Escalation_checklistItemId_type_idx" ON "Escalation"("checklistItemId", "type");
