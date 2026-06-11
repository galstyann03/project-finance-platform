import { prisma } from "../utils/prisma.js";

export interface AggregateRow {
  name: string;
  total: number;
}

export class ReportRepository {
  async expenseTotalsByName(projectId: number): Promise<AggregateRow[]> {
    const rows = await prisma.$queryRaw<Array<{ name: string; total: unknown }>>`
      SELECT LOWER(TRIM(name)) AS name, SUM(amount) AS total
      FROM Expense
      WHERE projectId = ${projectId}
      GROUP BY LOWER(TRIM(name))
    `;
    return rows.map((r) => ({ name: r.name, total: Number(r.total) }));
  }

  async incomeTotalsByName(projectId: number): Promise<AggregateRow[]> {
    const rows = await prisma.$queryRaw<Array<{ name: string; total: unknown }>>`
      SELECT LOWER(TRIM(name)) AS name, SUM(amount) AS total
      FROM Income
      WHERE projectId = ${projectId}
      GROUP BY LOWER(TRIM(name))
    `;
    return rows.map((r) => ({ name: r.name, total: Number(r.total) }));
  }
}
