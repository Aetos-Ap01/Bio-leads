-- CreateTable
CREATE TABLE "EvolutionConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "globalKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvolutionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionConfig_tenantId_key" ON "EvolutionConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "EvolutionConfig" ADD CONSTRAINT "EvolutionConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
