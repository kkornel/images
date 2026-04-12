# Images API

NestJS API for uploading, processing, storing, and listing images.

## Requirements

Before you run the project, make sure you have:

- Node.js `24.14.1`
- npm `11.11.0`
- PostgreSQL
- S3-compatible storage

For local development, you can use Docker Compose to run PostgreSQL and LocalStack.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Use `.env.example` as the source of truth for local development values.

If you want to check which environment variables are required and how they are validated, see:

`src/config/validation/environment.validation.ts`

## Run supporting services locally

```bash
docker-compose up
```

## Run the app

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

## API docs

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

Use the port from your `.env` file if it is different from `3000`.

## Tests

Run unit tests:

```bash
npm run test
```

Run e2e tests:

```bash
npm run test:e2e
```
