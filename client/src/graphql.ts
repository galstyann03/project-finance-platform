import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
      }
    }
  }
`;

export const PROJECTS = gql`
  query Projects {
    projects {
      id
      name
      location
      owner {
        email
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      location
    }
  }
`;

export const MY_INVITATIONS = gql`
  query MyInvitations {
    myInvitations {
      id
      status
      project {
        id
        name
      }
    }
  }
`;

export const INVITE_TO_PROJECT = gql`
  mutation InviteToProject($projectId: ID!, $email: String!) {
    inviteToProject(projectId: $projectId, email: $email) {
      id
      status
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($id: ID!) {
    acceptInvitation(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_INVITATION = gql`
  mutation RejectInvitation($id: ID!) {
    rejectInvitation(id: $id) {
      id
      status
    }
  }
`;
