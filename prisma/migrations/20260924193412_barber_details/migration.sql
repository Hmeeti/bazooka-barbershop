-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Barber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "bio" TEXT,
    "details" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 3,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "photoUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workStart" INTEGER NOT NULL DEFAULT 10,
    "workEnd" INTEGER NOT NULL DEFAULT 21,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Barber" ("bio", "createdAt", "id", "isActive", "name", "photoUrl", "specialization", "workEnd", "workStart") SELECT "bio", "createdAt", "id", "isActive", "name", "photoUrl", "specialization", "workEnd", "workStart" FROM "Barber";
DROP TABLE "Barber";
ALTER TABLE "new_Barber" RENAME TO "Barber";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
