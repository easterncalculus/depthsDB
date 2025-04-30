-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "side" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtypes" TEXT NOT NULL,
    "heroArchetype" TEXT,
    "manaCost" INTEGER,
    "dungeonArchetype" TEXT,
    "exits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
