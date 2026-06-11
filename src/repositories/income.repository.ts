import { prisma } from "../utils/prisma.js";

const withCreator = { creator: true } as const;

export class IncomeRepository {
  create(data: {
    projectId: number;
    name: string;
    amount: number;
    creatorId: number;
  }) {
    return prisma.income.create({ data, include: withCreator });
  }

  findById(id: number) {
    return prisma.income.findUnique({ where: { id } });
  }

  listByProject(projectId: number) {
    return prisma.income.findMany({
      where: { projectId },
      include: withCreator,
      orderBy: { createdAt: "desc" },
    });
  }

  update(id: number, data: { name?: string; amount?: number }) {
    return prisma.income.update({ where: { id }, data, include: withCreator });
  }

  delete(id: number) {
    return prisma.income.delete({ where: { id } });
  }
}
