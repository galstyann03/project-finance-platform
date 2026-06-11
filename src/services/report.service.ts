import { ReportRepository } from "../repositories/report.repository.js";
import { ProjectService } from "./project.service.js";

interface ReportItem {
  name: string;
  totalIncome: number;
  totalExpense: number;
  difference: number;
}

export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly projectService: ProjectService,
  ) {}

  async generate(userId: number, projectId: number) {
    await this.projectService.assertCanView(userId, projectId);

    const [expenseRows, incomeRows] = await Promise.all([
      this.reportRepository.expenseTotalsByName(projectId),
      this.reportRepository.incomeTotalsByName(projectId),
    ]);

    const byName = new Map<string, ReportItem>();
    const getItem = (name: string) => {
      let item = byName.get(name);
      if (!item) {
        item = { name, totalIncome: 0, totalExpense: 0, difference: 0 };
        byName.set(name, item);
      }
      return item;
    };

    for (const row of expenseRows) getItem(row.name).totalExpense = row.total;
    for (const row of incomeRows) getItem(row.name).totalIncome = row.total;

    let totalExpense = 0;
    let totalIncome = 0;
    const items = [...byName.values()].map((item) => {
      item.difference = item.totalIncome - item.totalExpense;
      totalExpense += item.totalExpense;
      totalIncome += item.totalIncome;
      return item;
    });

    return {
      projectId,
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      items,
    };
  }
}
