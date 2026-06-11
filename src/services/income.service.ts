import { IncomeRepository } from "../repositories/income.repository.js";
import { ProjectService } from "./project.service.js";
import { forbidden, notFound } from "../utils/AppError.js";

interface CreateIncomeInput {
  projectId: number;
  name: string;
  amount: number;
}

interface UpdateIncomeInput {
  name?: string;
  amount?: number;
}

export class IncomeService {
  constructor(
    private readonly incomeRepository: IncomeRepository,
    private readonly projectService: ProjectService,
  ) {}

  async create(userId: number, input: CreateIncomeInput) {
    await this.projectService.assertCanView(userId, input.projectId);
    return this.incomeRepository.create({ ...input, creatorId: userId });
  }

  async list(userId: number, projectId: number) {
    await this.projectService.assertCanView(userId, projectId);
    return this.incomeRepository.listByProject(projectId);
  }

  async update(userId: number, id: number, input: UpdateIncomeInput) {
    const income = await this.incomeRepository.findById(id);
    if (!income) throw notFound("Income not found");
    await this.assertCanModify(userId, income.projectId, income.creatorId);
    return this.incomeRepository.update(id, input);
  }

  async delete(userId: number, id: number) {
    const income = await this.incomeRepository.findById(id);
    if (!income) throw notFound("Income not found");
    await this.assertCanModify(userId, income.projectId, income.creatorId);
    await this.incomeRepository.delete(id);
    return true;
  }

  private async assertCanModify(
    userId: number,
    projectId: number,
    creatorId: number,
  ) {
    const project = await this.projectService.assertCanView(userId, projectId);
    if (creatorId !== userId && project.ownerId !== userId) {
      throw forbidden("Only the creator or the project owner can modify this income");
    }
  }
}
