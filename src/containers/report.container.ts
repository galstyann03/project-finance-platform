import { ReportRepository } from "../repositories/report.repository.js";
import { ReportService } from "../services/report.service.js";
import { projectService } from "./project.container.js";

export const reportRepository = new ReportRepository();
export const reportService = new ReportService(reportRepository, projectService);
