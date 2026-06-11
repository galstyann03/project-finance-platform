import { createTestServer, run, resetDb, teardown } from "./helpers.js";

const server = createTestServer();

const REGISTER = `
  mutation ($input: RegisterInput!) {
    register(input: $input) { token user { id email } }
  }
`;
const LOGIN = `
  mutation ($input: LoginInput!) {
    login(input: $input) { token }
  }
`;
const PROJECTS = `query { projects { id } }`;

beforeEach(resetDb);
afterAll(() => teardown(server));

describe("Authentication", () => {
  it("registers a new user and returns a token", async () => {
    const res = await run(server, REGISTER, {
      input: { email: "a@test.com", password: "secret123", name: "Al" },
    });
    const data = res.data as any;
    expect(res.errors).toBeUndefined();
    expect(data.register.token).toEqual(expect.any(String));
    expect(data.register.user.email).toBe("a@test.com");
  });

  it("logs in an existing user", async () => {
    await run(server, REGISTER, {
      input: { email: "a@test.com", password: "secret123" },
    });
    const res = await run(server, LOGIN, {
      input: { email: "a@test.com", password: "secret123" },
    });
    expect(res.errors).toBeUndefined();
    expect((res.data as any).login.token).toEqual(expect.any(String));
  });

  it("rejects login with a wrong password", async () => {
    await run(server, REGISTER, {
      input: { email: "a@test.com", password: "secret123" },
    });
    const res = await run(server, LOGIN, {
      input: { email: "a@test.com", password: "wrong-password" },
    });
    expect(res.errors?.[0].extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("blocks a protected operation without a token", async () => {
    const res = await run(server, PROJECTS); // user = null
    expect(res.errors?.[0].extensions?.code).toBe("UNAUTHENTICATED");
  });
});
