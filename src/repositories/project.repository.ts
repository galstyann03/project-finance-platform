import { prisma } from "../utils/prisma.js";

const withOwner = { owner: true } as const;

function accessibleWhere(userId: number) {
  return {
    OR: [
      { ownerId: userId },
      { invitations: { some: { inviteeId: userId, status: "ACCEPTED" as const } } },
    ],
  };
}

export class ProjectRepository {
  create(data: { name: string; location: string; ownerId: number }) {
    return prisma.project.create({ data, include: withOwner });
  }

  findById(id: number) {
    return prisma.project.findUnique({ where: { id } });
  }

  findAccessibleById(id: number, userId: number) {
    return prisma.project.findFirst({
      where: { id, ...accessibleWhere(userId) },
      include: withOwner,
    });
  }

  listForUser(userId: number) {
    return prisma.project.findMany({
      where: accessibleWhere(userId),
      include: withOwner,
      orderBy: { createdAt: "desc" },
    });
  }

  update(id: number, data: { name?: string; location?: string }) {
    return prisma.project.update({ where: { id }, data, include: withOwner });
  }

  delete(id: number) {
    return prisma.project.delete({ where: { id } });
  }
}
