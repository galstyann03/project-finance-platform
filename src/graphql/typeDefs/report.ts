export const reportTypeDefs = `#graphql
  type BudgetReportItem {
    name: String!
    totalIncome: Float!
    totalExpense: Float!
    difference: Float!
  }

  type BudgetReport {
    projectId: ID!
    totalIncome: Float!
    totalExpense: Float!
    difference: Float!
    items: [BudgetReportItem!]!
  }

  extend type Query {
    budgetReport(projectId: ID!): BudgetReport!
  }
`;
