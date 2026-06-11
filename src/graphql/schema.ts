import { authTypeDefs } from "./typeDefs/auth.js";
import { authResolvers } from "./resolvers/auth.js";
import { projectTypeDefs } from "./typeDefs/project.js";
import { projectResolvers } from "./resolvers/project.js";
import { invitationTypeDefs } from "./typeDefs/invitation.js";
import { invitationResolvers } from "./resolvers/invitation.js";
import { financeTypeDefs } from "./typeDefs/finance.js";
import { financeResolvers } from "./resolvers/finance.js";

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

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  projectTypeDefs,
  invitationTypeDefs,
  financeTypeDefs,
];
export const resolvers = [
  baseResolvers,
  authResolvers,
  projectResolvers,
  invitationResolvers,
  financeResolvers,
];
