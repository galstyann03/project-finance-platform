import { reportService } from "../../containers/report.container.js";
import { requireUser } from "../../utils/auth.js";
import type { GraphQLContext } from "../../context.js";

export const reportResolvers = {
  Query: {
    budgetReport: (
      _p: unknown,
      args: { projectId: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx);
      return reportService.generate(user.id, Number(args.projectId));
    },
  },
};
