-- CreateTable
CREATE TABLE "FollowupStat" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowupStat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FollowupStat" ADD CONSTRAINT "FollowupStat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
