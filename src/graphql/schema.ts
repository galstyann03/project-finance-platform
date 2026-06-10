import { authTypeDefs } from "./typeDefs/auth.js";
import { authResolvers } from "./resolvers/auth.js";
import { projectTypeDefs } from "./typeDefs/project.js";
import { projectResolvers } from "./resolvers/project.js";

// Base schema: defines the root Query/Mutation types that domain
// modules then `extend`. The Mutation placeholder is needed because a
// type must have at least one field before it can be extended.
const baseTypeDefs = `#graphql
  type Query {
    health: String!
  }

  type Mutation {
    _empty: Boolean
  }
`;

const baseResolvers = {
  Query: {
    health: () => "ok",
  },
};

// Apollo accepts arrays for typeDefs and resolvers and merges them.
export const typeDefs = [baseTypeDefs, authTypeDefs, projectTypeDefs];
export const resolvers = [baseResolvers, authResolvers, projectResolvers];
