import { createTestServer, run, resetDb, teardown } from "./helpers.js";
import { prisma } from "../src/utils/prisma.js";

const server = createTestServer();

beforeEach(resetDb);
afterAll(() => teardown(server));

async function seed() {
  const owner = await prisma.user.create({
    data: { email: "owner@test.com", password: "x" },
  });
  const invitee = await prisma.user.create({
    data: { email: "invitee@test.com", password: "x" },
  });
  const project = await prisma.project.create({
    data: { name: "P1", location: "Yerevan", ownerId: owner.id },
  });
  return { owner, invitee, project };
}

const INVITE = `
  mutation ($projectId: ID!, $email: String!) {
    inviteToProject(projectId: $projectId, email: $email) { id status }
  }
`;
const ACCEPT = `mutation ($id: ID!) { acceptInvitation(id: $id) { id status } }`;
const REJECT = `mutation ($id: ID!) { rejectInvitation(id: $id) { id status } }`;
const PROJECTS = `query { projects { id } }`;

describe("Invitations", () => {
  it("accepting an invitation grants project access", async () => {
    const { owner, invitee, project } = await seed();

    const inv = await run(
      server,
      INVITE,
      { projectId: String(project.id), email: invitee.email },
      { id: owner.id, email: owner.email },
    );
    const invId = (inv.data as any).inviteToProject.id;

    await run(server, ACCEPT, { id: invId }, { id: invitee.id, email: invitee.email });

    const res = await run(server, PROJECTS, {}, { id: invitee.id, email: invitee.email });
    expect((res.data as any).projects).toHaveLength(1);
  });

  it("rejecting an invitation does not grant access", async () => {
    const { owner, invitee, project } = await seed();

    const inv = await run(
      server,
      INVITE,
      { projectId: String(project.id), email: invitee.email },
      { id: owner.id, email: owner.email },
    );
    const invId = (inv.data as any).inviteToProject.id;

    await run(server, REJECT, { id: invId }, { id: invitee.id, email: invitee.email });

    const res = await run(server, PROJECTS, {}, { id: invitee.id, email: invitee.email });
    expect((res.data as any).projects).toHaveLength(0);
  });

  it("prevents a duplicate active invitation", async () => {
    const { owner, invitee, project } = await seed();
    const ownerCtx = { id: owner.id, email: owner.email };

    await run(server, INVITE, { projectId: String(project.id), email: invitee.email }, ownerCtx);
    const second = await run(
      server,
      INVITE,
      { projectId: String(project.id), email: invitee.email },
      ownerCtx,
    );
    expect(second.errors?.[0].extensions?.code).toBe("CONFLICT");
  });
});
