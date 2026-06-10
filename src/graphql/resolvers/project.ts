import { projectService } from "../../containers/project.container.js";
import { requireUser } from "../../utils/auth.js";
import { validate } from "../../validation/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../validation/project.validation.js";
import type { GraphQLContext } from "../../context.js";

export const projectResolvers = {
  Project: {
    createdAt: (p: { createdAt: Date }) => p.createdAt.toISOString(),
    updatedAt: (p: { updatedAt: Date }) => p.updatedAt.toISOString(),
  },

  Query: {
    projects: (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return projectService.list(user.id);
    },
    project: (_p: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return projectService.getById(user.id, Number(args.id));
    },
  },

  Mutation: {
    createProject: (_p: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      const input = validate(createProjectSchema, args.input);
      return projectService.create(user.id, input);
    },
    updateProject: (
      _p: unknown,
      args: { id: string; input: unknown },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      const input = validate(updateProjectSchema, args.input);
      return projectService.update(user.id, Number(args.id), input);
    },
    deleteProject: (_p: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return projectService.delete(user.id, Number(args.id));
    },
  },
};
