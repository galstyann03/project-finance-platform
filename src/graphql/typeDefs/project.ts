export const projectTypeDefs = `#graphql
  type Project {
    id: ID!
    name: String!
    location: String!
    owner: User!
    createdAt: String!
    updatedAt: String!
  }

  input CreateProjectInput {
    name: String!
    location: String!
  }

  input UpdateProjectInput {
    name: String
    location: String
  }

  extend type Query {
    projects: [Project!]!
    project(id: ID!): Project!
  }

  extend type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }
`;
