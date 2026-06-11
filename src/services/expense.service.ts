import { ExpenseRepository } from "../repositories/expense.repository.js";
import { ProjectService } from "./project.service.js";
import { forbidden, notFound } from "../utils/AppError.js";

interface CreateExpenseInput {
  projectId: number;
  name: string;
  amount: number;
}

interface UpdateExpenseInput {
  name?: string;
  amount?: number;
}

export class ExpenseService {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly projectService: ProjectService,
  ) {}

  async create(userId: number, input: CreateExpenseInput) {
    await this.projectService.assertCanView(userId, input.projectId);
    return this.expenseRepository.create({ ...input, creatorId: userId });
  }

  async list(userId: number, projectId: number) {
    await this.projectService.assertCanView(userId, projectId);
    return this.expenseRepository.listByProject(projectId);
  }

  async update(userId: number, id: number, input: UpdateExpenseInput) {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) throw notFound("Expense not found");
    await this.assertCanModify(userId, expense.projectId, expense.creatorId);
    return this.expenseRepository.update(id, input);
  }

  async delete(userId: number, id: number) {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) throw notFound("Expense not found");
    await this.assertCanModify(userId, expense.projectId, expense.creatorId);
    await this.expenseRepository.delete(id);
    return true;
  }

  private async assertCanModify(
    userId: number,
    projectId: number,
    creatorId: number,
  ) {
    const project = await this.projectService.assertCanView(userId, projectId);
    if (creatorId !== userId && project.ownerId !== userId) {
      throw forbidden("Only the creator or the project owner can modify this expense");
    }
  }
}
