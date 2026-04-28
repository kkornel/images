# Images API

NestJS API for uploading, processing, storing, listing, and deleting images.

## Requirements

Before you run the project, make sure you have:

- Docker
- Docker Compose
- Node.js `24.14.1` (for host-side dev tooling like tests and migrations)
- npm `11.11.0` (for host-side dev tooling like tests and migrations)

> The API itself starts with Docker Compose. You do not need to run `npm run start` on your host machine.

## Setup

1. Create an environment file:

```bash
cp .env.example .env
```

2. Use `.env.example` as the source of truth for local development values.

If you want to check which environment variables are required and how they are validated, see:

`src/config/validation/environment.validation.ts`

## Run the project (Docker)

Start all services (API, PostgreSQL, LocalStack):

```bash
docker-compose up --build
```

Run in detached mode:

```bash
docker-compose up -d --build
```

Stop services:

```bash
docker-compose down
```

## Database and migrations

For migration-based development, set:

```text
DATABASE_SYNCHRONIZE=false
```

The Docker API image is production-only, so run migration commands on your host.

Install dependencies on host:

```bash
npm install
```

Run migrations from host:

```bash
npm run migration:create -- src/infrastructure/persistence/typeorm/migrations/YourMigrationName
npm run migration:generate -- src/infrastructure/persistence/typeorm/migrations/YourMigrationName
npm run migration:run
npm run migration:revert
```



## API docs

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

Use the port from your `.env` file if it is different from `3000`.

## Tests

The Docker API image does not include Jest/dev dependencies, so run tests on host:

```bash
npm install
npm run test
npm run test:e2e
```
