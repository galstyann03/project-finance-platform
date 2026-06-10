import { ProjectRepository } from "../repositories/project.repository.js";
import { ProjectService } from "../services/project.service.js";

export const projectRepository = new ProjectRepository();
export const projectService = new ProjectService(projectRepository);
