import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs, resolvers } from "./graphql/schema.js";

export async function createApp() {
  const app = express();

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start(); // must finish before mounting the middleware

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apollo),
  );

  return app;
}
