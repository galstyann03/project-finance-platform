import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "../src/graphql/schema.js";
import { prisma } from "../src/utils/prisma.js";
import type { GraphQLContext } from "../src/context.js";

type User = GraphQLContext["user"];

export function createTestServer() {
  return new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
}

export async function run(
  server: ApolloServer<GraphQLContext>,
  query: string,
  variables: Record<string, unknown> = {},
  user: User = null,
) {
  const res = await server.executeOperation(
    { query, variables },
    { contextValue: { user } },
  );
  if (res.body.kind !== "single") {
    throw new Error("Expected a single GraphQL result");
  }
  return res.body.singleResult;
}

export async function resetDb() {
  await prisma.invitation.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardown(server: ApolloServer<GraphQLContext>) {
  await server.stop();
  await prisma.$disconnect();
}
