import { ProjectRepository } from "../repositories/project.repository.js";
import { forbidden, notFound } from "../utils/AppError.js";

interface CreateProjectInput {
  name: string;
  location: string;
}

interface UpdateProjectInput {
  name?: string;
  location?: string;
}

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  create(userId: number, input: CreateProjectInput) {
    return this.projectRepository.create({ ...input, ownerId: userId });
  }

  list(userId: number) {
    return this.projectRepository.listForUser(userId);
  }

  getById(userId: number, id: number) {
    return this.assertCanView(userId, id);
  }

  async assertCanView(userId: number, projectId: number) {
    const project = await this.projectRepository.findAccessibleById(projectId, userId);
    if (!project) {
      throw notFound("Project not found");
    }
    return project;
  }

  private async assertIsOwner(userId: number, projectId: number) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw notFound("Project not found");
    if (project.ownerId !== userId) {
      throw forbidden("Only the project owner can perform this action");
    }
    return project;
  }

  async update(userId: number, id: number, input: UpdateProjectInput) {
    await this.assertIsOwner(userId, id);
    return this.projectRepository.update(id, input);
  }

  async delete(userId: number, id: number) {
    await this.assertIsOwner(userId, id);
    await this.projectRepository.delete(id);
    return true;
  }
}
