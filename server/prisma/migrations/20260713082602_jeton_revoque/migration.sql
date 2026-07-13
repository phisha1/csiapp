-- CreateTable
CREATE TABLE "JetonRevoque" (
    "jti" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JetonRevoque_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "JetonRevoque_expiration_idx" ON "JetonRevoque"("expiration");
