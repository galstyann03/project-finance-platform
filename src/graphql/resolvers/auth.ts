import { authService, userRepository } from "../../containers/auth.container.js";
import { validate } from "../../validation/validate.js";
import { registerSchema, loginSchema } from "../../validation/auth.validation.js";
import type { GraphQLContext } from "../../context.js";

export const authResolvers = {
  User: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },

  Query: {
    me: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null;
      return userRepository.findById(ctx.user.id);
    },
  },

  Mutation: {
    register: (_parent: unknown, args: { input: unknown }) => {
      const input = validate(registerSchema, args.input);
      return authService.register(input);
    },
    login: (_parent: unknown, args: { input: unknown }) => {
      const input = validate(loginSchema, args.input);
      return authService.login(input);
    },
  },
};
