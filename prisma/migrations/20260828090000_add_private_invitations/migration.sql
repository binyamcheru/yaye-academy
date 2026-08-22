-- CreateTable
CREATE TABLE "PrivateInvitation" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "invitedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivateInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateInvitation_tokenHash_key" ON "PrivateInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "PrivateInvitation_cohortId_createdAt_idx" ON "PrivateInvitation"("cohortId", "createdAt");

-- CreateIndex
CREATE INDEX "PrivateInvitation_email_expiresAt_idx" ON "PrivateInvitation"("email", "expiresAt");

-- CreateIndex
CREATE INDEX "PrivateInvitation_invitedById_idx" ON "PrivateInvitation"("invitedById");

-- AddForeignKey
ALTER TABLE "PrivateInvitation" ADD CONSTRAINT "PrivateInvitation_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateInvitation" ADD CONSTRAINT "PrivateInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateInvitation" ADD CONSTRAINT "PrivateInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
