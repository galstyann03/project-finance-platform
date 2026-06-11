import { prisma } from "../utils/prisma.js";

const withCreator = { creator: true } as const;

export class ExpenseRepository {
  create(data: {
    projectId: number;
    name: string;
    amount: number;
    creatorId: number;
  }) {
    return prisma.expense.create({ data, include: withCreator });
  }

  findById(id: number) {
    return prisma.expense.findUnique({ where: { id } });
  }

  listByProject(projectId: number) {
    return prisma.expense.findMany({
      where: { projectId },
      include: withCreator,
      orderBy: { createdAt: "desc" },
    });
  }

  update(id: number, data: { name?: string; amount?: number }) {
    return prisma.expense.update({ where: { id }, data, include: withCreator });
  }

  delete(id: number) {
    return prisma.expense.delete({ where: { id } });
  }
}
