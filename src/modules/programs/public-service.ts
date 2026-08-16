import "server-only";

import {
  ProgramAccessType,
  ProgramLevel,
  ProgramStatus,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db";

export type PublicProgramFilters = Readonly<{
  search?: string;
  level?: ProgramLevel;
  accessType?: "FREE" | "PAID";
  take?: number;
}>;

export function listPublicPrograms(filters: PublicProgramFilters = {}) {
  const where: Prisma.ProgramWhereInput = {
    status: ProgramStatus.PUBLISHED,
    accessType: filters.accessType
      ? filters.accessType
      : { in: [ProgramAccessType.FREE, ProgramAccessType.PAID] },
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            {
              shortDescription: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  return prisma.program.findMany({
    where,
    take: filters.take,
    include: {
      modules: { select: { id: true } },
      cohorts: {
        where: { status: { in: ["UPCOMING", "ACTIVE"] } },
        orderBy: { startDate: "asc" },
        take: 1,
        include: {
          instructor: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
  });
}

export function getPublicProgram(slug: string) {
  return prisma.program.findFirst({
    where: {
      slug,
      status: ProgramStatus.PUBLISHED,
      accessType: { in: [ProgramAccessType.FREE, ProgramAccessType.PAID] },
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
      cohorts: {
        where: { status: { in: ["UPCOMING", "ACTIVE"] } },
        orderBy: { startDate: "asc" },
        include: {
          instructor: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
}
