# Posts Manager — Backend

NestJS REST API for managing users and posts with MySQL.

## Stack

- NestJS + TypeScript
- TypeORM + MySQL
- Jest + Supertest

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server (port 3000) |
| `npm run test:cov` | Unit tests + coverage |
| `npm run test:e2e` | E2E tests (requires MySQL) |
| `npm run db:reset` | Clear posts/users tables |

## API

- `GET/POST /users` — User CRUD
- `GET/POST /posts` — Post CRUD (requires `userId`)
