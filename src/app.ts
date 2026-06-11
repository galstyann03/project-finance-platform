import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs, resolvers } from "./graphql/schema.js";
import { buildContext, type GraphQLContext } from "./context.js";

const isProd = process.env.NODE_ENV === "production";

const SAFE_ERROR_CODES = new Set([
  "BAD_USER_INPUT",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "GRAPHQL_VALIDATION_FAILED",
  "GRAPHQL_PARSE_FAILED",
]);

export async function createApp() {
  const app = express();

  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: !isProd,
    formatError: (formattedError, error) => {
      const code = String(formattedError.extensions?.code ?? "");

      if (SAFE_ERROR_CODES.has(code)) {
        return { message: formattedError.message, extensions: { code } };
      }

      console.error("Unexpected GraphQL error:", error);
      if (isProd) {
        return {
          message: "Internal server error",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        };
      }
      return formattedError;
    },
  });
  await apollo.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext({ req }),
    }),
  );

  return app;
}
