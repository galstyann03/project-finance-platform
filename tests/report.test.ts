import { createTestServer, run, resetDb, teardown } from "./helpers.js";
import { prisma } from "../src/utils/prisma.js";

const server = createTestServer();

beforeEach(resetDb);
afterAll(() => teardown(server));

const REPORT = `
  query ($projectId: ID!) {
    budgetReport(projectId: $projectId) {
      totalIncome
      totalExpense
      difference
      items { name totalIncome totalExpense difference }
    }
  }
`;

describe("Budget report", () => {
  it("aggregates same-name records and handles one-sided names", async () => {
    const owner = await prisma.user.create({
      data: { email: "o@test.com", password: "x" },
    });
    const project = await prisma.project.create({
      data: { name: "P", location: "L", ownerId: owner.id },
    });

    await prisma.expense.createMany({
      data: [
        { projectId: project.id, name: "Cement", amount: 100, creatorId: owner.id },
        { projectId: project.id, name: "  cement ", amount: 50, creatorId: owner.id },
        { projectId: project.id, name: "Labor", amount: 200, creatorId: owner.id },
      ],
    });
    await prisma.income.createMany({
      data: [
        { projectId: project.id, name: "CEMENT", amount: 400, creatorId: owner.id },
        { projectId: project.id, name: "Deposit", amount: 1000, creatorId: owner.id },
      ],
    });

    const res = await run(
      server,
      REPORT,
      { projectId: String(project.id) },
      { id: owner.id, email: owner.email },
    );
    const report = (res.data as any).budgetReport;
    const item = (name: string) =>
      report.items.find((i: any) => i.name === name);

    expect(item("cement").totalExpense).toBe(150);
    expect(item("cement").totalIncome).toBe(400);
    expect(item("cement").difference).toBe(250);

    expect(item("labor").totalExpense).toBe(200);
    expect(item("labor").totalIncome).toBe(0);

    expect(item("deposit").totalIncome).toBe(1000);
    expect(item("deposit").totalExpense).toBe(0);

    expect(report.totalExpense).toBe(350);
    expect(report.totalIncome).toBe(1400);
    expect(report.difference).toBe(1050);
  });
});
