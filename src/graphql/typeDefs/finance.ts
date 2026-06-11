export const financeTypeDefs = `#graphql
  type Expense {
    id: ID!
    name: String!
    amount: Float!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type Income {
    id: ID!
    name: String!
    amount: Float!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  input CreateExpenseInput {
    projectId: ID!
    name: String!
    amount: Float!
  }

  input UpdateExpenseInput {
    name: String
    amount: Float
  }

  input CreateIncomeInput {
    projectId: ID!
    name: String!
    amount: Float!
  }

  input UpdateIncomeInput {
    name: String
    amount: Float
  }

  extend type Query {
    expenses(projectId: ID!): [Expense!]!
    incomes(projectId: ID!): [Income!]!
  }

  extend type Mutation {
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!

    createIncome(input: CreateIncomeInput!): Income!
    updateIncome(id: ID!, input: UpdateIncomeInput!): Income!
    deleteIncome(id: ID!): Boolean!
  }
`;
