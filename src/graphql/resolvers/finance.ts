import { expenseService, incomeService } from "../../containers/finance.container.js";
import { requireUser } from "../../utils/auth.js";
import { validate } from "../../validation/validate.js";
import {
  createRecordSchema,
  updateRecordSchema,
} from "../../validation/finance.validation.js";
import type { GraphQLContext } from "../../context.js";

const recordFieldResolvers = {
  amount: (p: { amount: unknown }) => Number(p.amount),
  createdAt: (p: { createdAt: Date }) => p.createdAt.toISOString(),
  updatedAt: (p: { updatedAt: Date }) => p.updatedAt.toISOString(),
};

export const financeResolvers = {
  Expense: recordFieldResolvers,
  Income: recordFieldResolvers,

  Query: {
    expenses: (_p: unknown, args: { projectId: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return expenseService.list(user.id, Number(args.projectId));
    },
    incomes: (_p: unknown, args: { projectId: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return incomeService.list(user.id, Number(args.projectId));
    },
  },

  Mutation: {
    createExpense: (_p: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      const input = validate(createRecordSchema, args.input);
      return expenseService.create(user.id, {
        ...input,
        projectId: Number(input.projectId),
      });
    },
    updateExpense: (
      _p: unknown,
      args: { id: string; input: unknown },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      const input = validate(updateRecordSchema, args.input);
      return expenseService.update(user.id, Number(args.id), input);
    },
    deleteExpense: (_p: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return expenseService.delete(user.id, Number(args.id));
    },

    createIncome: (_p: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      const input = validate(createRecordSchema, args.input);
      return incomeService.create(user.id, {
        ...input,
        projectId: Number(input.projectId),
      });
    },
    updateIncome: (
      _p: unknown,
      args: { id: string; input: unknown },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      const input = validate(updateRecordSchema, args.input);
      return incomeService.update(user.id, Number(args.id), input);
    },
    deleteIncome: (_p: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return incomeService.delete(user.id, Number(args.id));
    },
  },
};
