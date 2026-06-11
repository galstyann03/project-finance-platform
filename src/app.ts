import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs, resolvers } from "./graphql/schema.js";
import { buildContext, type GraphQLContext } from "./context.js";

export async function createApp() {
  const app = express();

  const apollo = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
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
