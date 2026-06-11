# Project Finance Management Platform

A GraphQL API to manage projects, collaborate via invitations, and track project
finances (expenses & incomes) with a dynamically generated budget report.

## Tech stack

- **Node.js + Express**
- **Apollo GraphQL Server v5** (`@apollo/server` + `@as-integrations/express4`)
- **Prisma ORM v6** with **MySQL 8** (run in Docker)
- **JWT** authentication (`jsonwebtoken`) + **bcryptjs** password hashing
- **Joi** for input validation
- **TypeScript** (ESM / NodeNext)
- **Jest** for automated tests

## Features

- **Auth** — register, login, JWT-based authentication; protected operations.
- **Projects** — create / update / delete / get / list. Owner-only update & delete;
  owner and accepted members can view.
- **Invitations** — invite by email, accept / reject, list my invitations.
  Only one active invitation per user per project; safe under concurrent requests.
- **Expenses & Incomes** — full CRUD. Owner and accepted members can create;
  only the creator or the project owner can update / delete.
- **Budget report** — generated dynamically by aggregating expenses and incomes
  matched by lowercased/trimmed name (no Budget table, no N+1).

---

## Prerequisites

- **Node.js** 20+ (developed on 24)
- **Docker** + Docker Compose (MySQL runs in a container; no local MySQL needed)

## Installation

```bash
git clone git@github.com:galstyann03/project-finance-platform.git
cd project-finance-platform
npm install
```

## Environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env
```

| Variable         | Description                                  | Example                                          |
| ---------------- | -------------------------------------------- | ------------------------------------------------ |
| `PORT`           | HTTP port for the API                        | `4000`                                            |
| `JWT_SECRET`     | Secret used to sign JWTs (use a long random) | `a-long-random-string`                            |
| `JWT_EXPIRES_IN` | Token lifetime                               | `1d`                                              |
| `DATABASE_URL`   | MySQL connection string                      | `mysql://root:root@localhost:3307/finance`        |

> `.env` is gitignored. Only `.env.example` is committed.

## Database setup

Start MySQL in Docker and apply the migrations:

```bash
docker compose up -d           # start MySQL 8 on host port 3307
npx prisma migrate dev         # apply migrations + generate the Prisma client
```

Optional helpers:

```bash
npx prisma studio              # browse the database in your browser
npx prisma migrate reset       # drop, recreate, and re-migrate (clears data)
```

## Running the application

```bash
npm run dev      # development with hot reload (tsx)
# or
npm run build    # compile TypeScript to dist/
npm start        # run the compiled server
```

The GraphQL endpoint and Apollo Sandbox are at **http://localhost:4000/graphql**.

### Authenticating in the Sandbox

1. Run `register` or `login` — both return a `token`.
2. In the Sandbox **Headers** panel add: `Authorization: Bearer <token>`.
3. Protected operations now run as that user.

### Example operations

```graphql
# Register (returns a token)
mutation {
  register(input: { email: "a@test.com", password: "secret123", name: "Al" }) {
    token
    user { id email }
  }
}

# Create a project (requires auth header)
mutation {
  createProject(input: { name: "Villa", location: "Yerevan" }) { id name }
}

# Invite a user, then they accept it
mutation { inviteToProject(projectId: 1, email: "bob@test.com") { id status } }
mutation { acceptInvitation(id: 1) { id status } }

# Add finance records
mutation { createExpense(input: { projectId: 1, name: "Cement", amount: 250.50 }) { id } }
mutation { createIncome(input: { projectId: 1, name: "Deposit", amount: 1000 }) { id } }

# Budget report
query {
  budgetReport(projectId: 1) {
    totalIncome totalExpense difference
    items { name totalIncome totalExpense difference }
  }
}
```

## Running tests

Tests run as **integration tests** against a separate MySQL database so they never
touch your dev data. The MySQL container must be running.

```bash
# one-time: create the test database
docker exec finance_mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS finance_test;"

npm test
```

The test setup points `DATABASE_URL` at `finance_test` (see `.env.test`), applies the
migrations, and resets the tables between tests. Covered areas:

- **Auth** — registration, login, and rejection of protected operations without a token.
- **Invitations** — successful acceptance, rejection, and prevention of duplicate active invitations.
- **Budget report** — same-name aggregation and correct handling of one-sided names.

---

## Project structure

Layered architecture (a resolver plays the role of a REST controller):

```
prisma/
  schema.prisma          # data model + migrations
src/
  server.ts              # entry point
  app.ts                 # Express + Apollo wiring
  context.ts             # per-request auth context (JWT -> user)
  configs/               # env-driven config
  graphql/
    schema.ts            # merges all typeDefs + resolvers
    typeDefs/            # GraphQL SDL per domain
    resolvers/           # resolvers per domain (thin: validate -> service)
  services/              # business logic + authorization
  repositories/          # database access (Prisma) only
  containers/            # manual dependency injection (wires repo -> service)
  validation/            # Joi schemas
  utils/                 # prisma client, jwt, password, errors, guards
tests/                   # Jest integration tests
```

**Request flow:** `resolver → service → repository → Prisma → MySQL`, with `context`
attaching the authenticated user before resolvers run.

## Design decisions

- **Membership = an accepted invitation.** There is no separate members table; a user
  can access a project if they are the owner **or** have an `ACCEPTED` invitation. Single
  source of truth, fewer tables.
- **Invite by email → registered user.** Invitations target an existing account
  (`inviteeId`). Inviting an email with no account returns an error. (Assumption documented below.)
- **One invitation per (project, user), concurrency-safe.** `@@unique([projectId, inviteeId])`
  guarantees a single invitation row; duplicate creates fail at the DB (`P2002`) and are
  mapped to a friendly conflict. Accept/Reject use a **status-guarded conditional update**
  (`updateMany where status = PENDING`) so concurrent requests can't double-process.
- **Money as `Decimal(12,2)`**, never floating point.
- **Budget report avoids N+1.** Two aggregate queries (`GROUP BY LOWER(TRIM(name))`,
  one per table) compute the totals in MySQL; results are merged by normalized name in code.
- **Authorization in services**, not resolvers. Resolvers stay thin (auth guard → validate →
  delegate). Errors are typed (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
  `BAD_USER_INPUT`) and surfaced via GraphQL `extensions.code`.
- **Indexing:** unique `User.email`; unique `(projectId, inviteeId)` + index on
  `inviteeId`; indexes on `Project.ownerId`, `Expense.projectId`, `Income.projectId`, and
  `(projectId, name)` to support the report.

## Assumptions & trade-offs

- An invitee must already be a registered user.
- Expenses and incomes are modeled as two separate tables (clear mapping to the spec);
  they could be unified into one table with a `type` enum.
- Re-inviting a previously **rejected** user reactivates the same invitation row.
- Possible improvement: a persisted, indexed normalized `nameKey` column would let the
  budget report use Prisma's typed `groupBy` instead of raw SQL.
