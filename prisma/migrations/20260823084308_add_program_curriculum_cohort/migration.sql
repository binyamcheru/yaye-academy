-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProgramAccessType" AS ENUM ('FREE', 'PAID', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "level" "ProgramLevel" NOT NULL,
    "accessType" "ProgramAccessType" NOT NULL,
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "durationWeeks" INTEGER,
    "learningOutcomes" JSONB NOT NULL DEFAULT '[]',
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "resources" JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "instructorId" TEXT,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "status" "CohortStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE INDEX "Program_status_accessType_idx" ON "Program"("status", "accessType");

-- CreateIndex
CREATE INDEX "Program_createdById_idx" ON "Program"("createdById");

-- CreateIndex
CREATE INDEX "Module_programId_idx" ON "Module"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_programId_order_key" ON "Module"("programId", "order");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_idx" ON "Lesson"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_order_key" ON "Lesson"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_slug_key" ON "Lesson"("moduleId", "slug");

-- CreateIndex
CREATE INDEX "Cohort_programId_status_idx" ON "Cohort"("programId", "status");

-- CreateIndex
CREATE INDEX "Cohort_instructorId_idx" ON "Cohort"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "Cohort_programId_name_key" ON "Cohort"("programId", "name");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
