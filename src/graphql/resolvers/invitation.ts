import { invitationService } from "../../containers/invitation.container.js";
import { requireUser } from "../../utils/auth.js";
import { validate } from "../../validation/validate.js";
import { inviteSchema } from "../../validation/invitation.validation.js";
import type { GraphQLContext } from "../../context.js";

export const invitationResolvers = {
  Invitation: {
    createdAt: (p: { createdAt: Date }) => p.createdAt.toISOString(),
    updatedAt: (p: { updatedAt: Date }) => p.updatedAt.toISOString(),
  },

  Query: {
    myInvitations: (_p: unknown, _a: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx);
      return invitationService.listMine(user.id);
    },
  },

  Mutation: {
    inviteToProject: (
      _p: unknown,
      args: { projectId: string; email: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      const { projectId, email } = validate(inviteSchema, {
        projectId: args.projectId,
        email: args.email,
      });
      return invitationService.invite(user.id, Number(projectId), email);
    },
    acceptInvitation: (
      _p: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      return invitationService.accept(user.id, Number(args.id));
    },
    rejectInvitation: (
      _p: unknown,
      args: { id: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      return invitationService.reject(user.id, Number(args.id));
    },
  },
};
