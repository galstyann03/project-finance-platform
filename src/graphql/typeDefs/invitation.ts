export const invitationTypeDefs = `#graphql
  enum InvitationStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type Invitation {
    id: ID!
    status: InvitationStatus!
    project: Project!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    myInvitations: [Invitation!]!
  }

  extend type Mutation {
    inviteToProject(projectId: ID!, email: String!): Invitation!
    acceptInvitation(id: ID!): Invitation!
    rejectInvitation(id: ID!): Invitation!
  }
`;
