import { ExpenseRepository } from "../repositories/expense.repository.js";
import { IncomeRepository } from "../repositories/income.repository.js";
import { ExpenseService } from "../services/expense.service.js";
import { IncomeService } from "../services/income.service.js";
import { projectService } from "./project.container.js";

export const expenseRepository = new ExpenseRepository();
export const incomeRepository = new IncomeRepository();

export const expenseService = new ExpenseService(expenseRepository, projectService);
export const incomeService = new IncomeService(incomeRepository, projectService);
