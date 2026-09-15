# Agentflow_AI

> Turn plain-English instructions into observable, executable AI workflows.

## Live Demo

| Service | Link | Purpose |
| --- | --- | --- |
| Frontend | [Open Agentflow_AI](https://nxtwave-agentic-ai.vercel.app) | Operator console |
| Backend API | [Open API](https://nxtwave-agentic-ai.onrender.com) | Express API and Socket.IO server |
| API health | [Check system health](https://nxtwave-agentic-ai.onrender.com/api/health) | Deployment and service status |
| Source code | [GitHub repository](https://github.com/PROGRAMERPARTH/Nxtwave_Agentic_Ai) | Project source and issues |

> **Current deployment note:** the frontend and backend are live. The backend currently falls back to in-memory MongoDB/Redis when production services are not configured, so persistent production data requires the Render environment variables described below.

## What Is Agentflow_AI?

Agentflow_AI is an AI operations automation platform for operators who need to design, run, and audit business automations without manually wiring every API call. An operator describes an automation in natural language, reviews the generated graph on a visual canvas, executes it through cooperating agents, and follows every step in a real-time timeline.

## The Motive

Traditional automation tools can connect services, but they often hide the reasoning and failure handling behind a black box. Agentflow_AI is designed to make automation:

- **Understandable:** prompts become visible workflow graphs that operators can inspect and edit.
- **Resilient:** planner, execution, validation, recovery, and monitoring agents handle the lifecycle together.
- **Observable:** every agent step becomes a live event and a persisted audit log.
- **Actionable:** workflows can use Gmail, Slack, Discord, Google Sheets, and AI providers.
- **Safe to operate:** credentials are encrypted at rest, routes are protected, and failures become explicit states instead of silent errors.

## How It Works

```text
Describe an automation
  |
  v
Generate or edit a workflow graph
  |
  v
Run the five-agent execution chain
  |
  v
Validate, retry, recover, or escalate
  |
  v
Stream events and persist the audit timeline
```

### Typical operator journey

1. Register or sign in.
2. Enter a prompt such as “When an invoice arrives, extract its data and notify Slack.”
3. Review the generated nodes, edges, and configuration.
4. Connect the required provider integrations.
5. Execute the workflow.
6. Watch live planner, execution, validation, recovery, and monitoring events.
7. Review the final output, logs, notifications, and execution history.

## Core Capabilities

- Natural-language prompt-to-workflow generation.
- Drag-and-drop React Flow workflow editor.
- Workflow creation, search, versioning, duplication, tagging, and deletion.
- Five-agent orchestration: planner, execution, validation, recovery, and monitoring.
- Gmail, Slack, Discord, and Google Sheets integration architecture.
- OpenRouter and Gemini generation with a deterministic offline fallback.
- JWT authentication with operator/admin roles and persistent client sessions.
- Execution pause, resume, cancel, retry, and escalation states.
- Socket.IO live events, notifications, and complete execution timelines.
- MongoDB persistence with a development fallback and encrypted provider credentials.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, Pages Router, Tailwind CSS, Zustand, Axios |
| Workflow UI | `@xyflow/react`, animated edges, node palette, configuration panels |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, express-validator |
| Background jobs | BullMQ, ioredis, Redis, in-memory queue fallback |
| Real time | Socket.IO server and client |
| AI | OpenRouter, Google Generative AI, LangChain/LangGraph-compatible orchestration |
| Integrations | Gmail, Slack, Discord, Google Sheets |
| Security | Helmet, CORS, rate limiting, encrypted credentials, request validation |
| Deployment | Vercel frontend, Render backend, MongoDB Atlas, hosted Redis |

## Quick Start

### Run the deployed application

Open the [live frontend](https://nxtwave-agentic-ai.vercel.app), create an operator account, and use the workflow builder. The [backend health endpoint](https://nxtwave-agentic-ai.onrender.com/api/health) confirms whether production database and AI services are configured.

### Run locally

Requirements: Node.js 20+, npm, Git, and Docker Desktop for local MongoDB/Redis.

```powershell
git clone https://github.com/PROGRAMERPARTH/Nxtwave_Agentic_Ai.git
Set-Location Nxtwave_Agentic_Ai
npm install
npm run install:all
docker compose up -d mongodb redis
npm run dev
```

Open `http://localhost:3000`. The API runs at `http://localhost:5000` and its health check is `http://localhost:5000/api/health`.

For environment variables, provider setup, troubleshooting, and phase-by-phase verification, continue with the sections below.

## Architecture

```text
Browser (Next.js Pages Router)
        |
        | REST + Socket.IO
        v
Express API server
  routes -> controllers -> services -> models/integrations
                         |
                         +-> agent orchestrator
                         +-> execution queue (BullMQ/Redis)
                         +-> notification and execution logs
        |
        +-> MongoDB (or documented in-memory fallback)
```

The frontend lives in `client/` and the backend lives in `server/`.

Controllers only parse requests and shape responses. Services own business rules and persistence. Agents must remain independent of HTTP. Integrations are accessed by the integration service through the common integration interface; agents must not call provider SDKs directly.

## Prerequisites

Install these before starting local development:

1. Node.js 20 LTS or newer.
2. npm 10 or newer.
3. Git.
4. Docker Desktop, recommended for MongoDB and Redis.
5. A browser with developer tools.

Optional provider accounts are needed only for real provider actions:

- OpenRouter API key.
- Google Gemini API key.
- Google Cloud OAuth application for Gmail and Google Sheets.
- Slack app with OAuth scopes and event subscriptions.
- Discord application and bot token.

Verify the required tools:

```powershell
node --version
npm --version
git --version
docker --version
docker compose version
```

## Project Layout

Create the implementation using this layout:

```text
.
├── client/
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── store/
├── server/
│   ├── package.json
│   └── src/
│       ├── agents/
│       ├── config/
│       ├── controllers/
│       ├── integrations/
│       ├── models/
│       ├── queues/
│       ├── routes/
│       └── services/
├── docker-compose.yml
├── package.json
└── README.md
```

The required detailed frontend and backend paths are listed in the specification. Keep those names stable because they describe the intended ownership boundaries.

## Bootstrap the Repository

Run these commands from the repository root after the source files have been created:

```powershell
npm install
Set-Location server
npm install
Set-Location ..\client
npm install
Set-Location ..
```

The root package should expose these convenience scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "dev:server": "npm run dev --prefix server",
    "dev:client": "npm run dev --prefix client",
    "build": "npm run build --prefix client",
    "test": "npm run test --prefix server && npm run test --prefix client"
  }
}
```

Use `npm run dev` from the root for the normal two-service development experience. Expected URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Start Local Infrastructure

Run MongoDB and Redis with Docker Compose:

```powershell
docker compose up -d mongodb redis
docker compose ps
```

Expected local connection strings:

```text
MongoDB: mongodb://127.0.0.1:27017/agentflow_ai
Redis:   redis://127.0.0.1:6379
```

Stop the services when finished:

```powershell
docker compose down
```

The server must still start if MongoDB or Redis is unavailable. MongoDB should use the specified in-memory fallback, and the execution queue should use its in-memory fallback when Redis is not configured. These fallbacks are for local development and must not be presented as production persistence.

## Environment Configuration

Create `server/.env` from this template. Never commit this file or real credentials.

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://127.0.0.1:27017/agentflow_ai
REDIS_URL=redis://127.0.0.1:6379

JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=replace-with-32-byte-development-key

# Optional AI providers. The server falls back automatically.
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# OAuth callback base URL
OAUTH_CALLBACK_BASE_URL=http://localhost:5000/api/integrations/oauth

# Gmail and Google Sheets
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/google/callback

# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

# Discord bot/OAuth configuration
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback
```

Generate strong local secrets instead of copying the placeholders. `CREDENTIAL_ENCRYPTION_KEY` must be stable for the lifetime of the local database and must be exactly the length required by the chosen authenticated encryption implementation. If it changes, previously stored provider tokens cannot be decrypted.

The frontend should use a separate `client/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Only variables prefixed with `NEXT_PUBLIC_` may be exposed to browser code. Provider secrets, JWT secrets, and encryption keys belong exclusively in `server/.env`.

## Provider Setup

Provider setup is optional for the deterministic workflow builder and mocked/local execution paths. It is required for real external actions.

### Google

1. Create a Google Cloud project.
2. Enable Gmail API and Google Sheets API.
3. Configure the OAuth consent screen.
4. Create a Web application OAuth client.
5. Add the exact local callback URI configured in `GOOGLE_REDIRECT_URI`.
6. Copy the client ID and secret into `server/.env`.

### Slack

1. Create a Slack app.
2. Add the required OAuth scopes for posting messages and subscribing to events.
3. Add the exact local redirect URI.
4. Configure event subscriptions if Slack events are required.
5. Copy the client ID and secret into `server/.env`.

### Discord

1. Create a Discord application and bot.
2. Enable the required bot permissions.
3. Install the bot in a test server.
4. Configure the OAuth redirect URI if user authorization is used.
5. Store the bot token only in `server/.env`.

### AI providers

Set `OPENROUTER_API_KEY` to make OpenRouter the preferred generator. Set `GEMINI_API_KEY` to enable Gemini fallback. With both unset, the deterministic builder must still create runnable graphs for email, invoice routing, Slack/Discord notification, and sheet append prompts.

## Implementation Order

Implement and verify each phase before starting the next one.

### Phase 1: Foundation

- Create root, `client`, and `server` package manifests.
- Add Next.js Pages Router, Express, configuration loading, error handling, and health endpoint.
- Add MongoDB connection with in-memory fallback.
- Add `User` model, bcrypt cost factor 12, JWT registration/login/me routes, and protected middleware.
- Add Zustand persisted auth state and login/register pages.
- Add AppShell and root route behavior.

Check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Register, log in, reload the browser, and confirm the session remains available.

### Phase 2: Workflow Editor

- Add workflow model and service.
- Implement workflow list, search, create, update, duplicate, version, and delete endpoints.
- Add React Flow canvas, animated edges, node palette, drag-to-create behavior, and node configuration panel.
- Add builder, workflow list, and workflow editor pages.

Check that a workflow can be created, saved, reopened, duplicated, and deleted without losing nodes, edges, tags, trigger configuration, or version.

### Phase 3: AI Generation

- Implement provider selection in `aiService`.
- Validate AI output into a complete graph containing named nodes, positions, edges, and node configuration.
- Implement the deterministic fallback for common prompts.
- Add prompt builder UI and preview.

Check generation with no AI keys first. This must work offline and must return a runnable graph. Then test OpenRouter and Gemini independently.

### Phase 4: Agentic Execution

- Implement planner, execution, validation, recovery, monitoring, and orchestrator modules.
- Keep agents pure and pass integration access through the service layer.
- Persist executions with an immutable workflow snapshot.
- Add execution logs for every agent event.
- Implement pause, resume, cancel, retry classification, and escalation.
- Include `langGraph: "available"` or `langGraph: "not-installed"` in every run result.

Check successful execution, missing required fields, an unavailable integration, an expired credential, a transient failure, pause/resume, cancellation, retry, and escalation.

### Phase 5: Integrations and Security

- Implement the common integration interface and provider adapters.
- Add OAuth start, callback, and error routes.
- Encrypt access and refresh tokens at rest with `CREDENTIAL_ENCRYPTION_KEY`.
- Add integrations status page and reconnect behavior.
- Add explicit `INTEGRATION_NOT_CONNECTED` and `AUTH_EXPIRED` errors.

Check that tokens never appear in logs or API responses and that reconnecting does not create duplicate active connections.

### Phase 6: Queue and Real-Time Operations

- Add BullMQ and Redis execution queue with retry backoff.
- Keep the in-memory queue fallback for development without Redis.
- Add Socket.IO server and client subscription by execution ID.
- Render planner, execution, validation, recovery, and monitoring events in the live timeline.
- Persist success, failure, and escalation notifications and expose the notification drawer.
- Add executions list/detail pages, filtering, sorting, pagination, and live refresh.

Check that a queued execution produces matching Socket.IO events, `ExecutionLog` records, final execution state, and notifications.

## Local Run Procedure

Once the implementation exists, use this sequence for every fresh checkout:

1. Clone the repository and enter it.
2. Copy the environment templates to `server/.env` and `client/.env.local`.
3. Fill in local secrets and any provider credentials.
4. Run `npm install` at the root, then install dependencies in `server` and `client`.
5. Start infrastructure with `docker compose up -d mongodb redis`.
6. Start the application with `npm run dev`.
7. Open `http://localhost:3000`.
8. Register an operator account.
9. Generate or manually create a workflow.
10. Connect an integration, or use the deterministic/local path for an offline test.
11. Execute the workflow and inspect the timeline, logs, status, and notification drawer.
12. Stop the app and infrastructure with `docker compose down` when finished.

## Verification Checklist

Before considering a phase complete, verify:

- `GET /api/health` reports API, database, queue, and environment status.
- Auth endpoints reject invalid input and protected routes reject missing/invalid JWTs.
- Passwords are stored using bcrypt cost factor 12 and are never returned.
- CORS is restricted to `CLIENT_URL`; helmet, compression, morgan, validation, and auth rate limiting are enabled.
- Workflow owners cannot read or mutate another owner's workflow.
- Every execution stores an immutable workflow snapshot and one log per agent event.
- Missing or expired integrations produce explicit typed errors.
- Decrypted credentials are never logged, persisted in plaintext, or returned to the client.
- Offline prompt generation works with no AI keys.
- Redis outage does not prevent local development execution.
- Socket.IO events and persisted timeline logs describe the same agent steps.
- Client loading, empty, error, paused, retrying, failed, and cancelled states are visible and usable.

Suggested commands:

```powershell
npm run test
npm run build
Invoke-RestMethod http://localhost:5000/api/health
```

Add linting and API/integration tests to the package scripts as the implementation is created. Run backend tests against an isolated test database and never against a developer's persistent database.

## Troubleshooting

**Port 3000 or 5000 is already in use**

Change the Next.js port or `PORT`, then update `CLIENT_URL`, `NEXT_PUBLIC_API_URL`, and OAuth redirect URIs consistently.

**MongoDB is unavailable**

Run `docker compose ps` and inspect `docker compose logs mongodb`. The server may use its in-memory fallback, but data will be lost on restart.

**Redis is unavailable**

Inspect `docker compose logs redis`. The queue fallback should allow local execution, but BullMQ retry and scheduling behavior cannot be verified until Redis is available.

**OAuth callback fails**

Confirm the callback URL matches exactly in the provider console, `.env`, protocol, host, port, and path included.

**Stored credentials cannot be decrypted**

Restore the original `CREDENTIAL_ENCRYPTION_KEY` or remove the local integration records and reconnect them. Do not rotate the key casually in a database containing encrypted credentials.

**AI generation fails**

Check the server logs for provider status without printing secrets. Remove the provider key temporarily to verify that the deterministic fallback still works.

## Security Rules

- Keep all secrets in environment variables or a managed secret store.
- Never commit `.env`, OAuth client secrets, JWT secrets, encryption keys, or tokens.
- Use HTTPS and secure cookie settings in production.
- Restrict CORS to known frontend origins.
- Validate every request body and parameter.
- Rate-limit registration and login.
- Use a new encryption key per environment and back it up securely.
- Redact authorization headers and provider responses from logs.
- Use separate development, test, and production databases.

## Production Notes

The in-memory database and queue fallbacks are intentionally for local development only. A production deployment requires managed MongoDB, Redis, a stable encryption key, TLS, provider-approved public OAuth callback URLs, restricted CORS, secret management, monitoring, backups, and a process manager or container orchestration strategy.

The final acceptance flow is: register, describe an automation, inspect and save the generated graph, connect the required provider, execute it, observe all five agent stages live, verify the persisted audit trail, and confirm success, retry, failure, escalation, and notification behavior.
