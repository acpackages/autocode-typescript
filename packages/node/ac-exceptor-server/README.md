# @autocode-ts/ac-exceptor-server

A centralized server package for collecting, deduplicating, grouping, and analyzing exception logs recorded by client devices using `ac_exceptor` (Dart, Flutter, Web, Node.js, etc.).

## Features

- **Automated Deduplication**: Computes deterministic fingerprints (SHA-256) of exception types and messages to group matching errors automatically.
- **Occurrence Tracking**: Records every client occurrence with device metadata (OS, model, versions, session, user ID, breadcrumbs/diagnostics) while keeping aggregated totals (`occurrence_count`, `affected_devices_count`, `first_occurred_at`, `last_occurred_at`).
- **Data Dictionary Driven**: Schema is fully registered using `@autocode-ts/ac-data-dictionary` and idempotently provisioned with `@autocode-ts/ac-sql` and `@autocode-ts/ac-sql-node`.
- **Offline Batch Support**: Ingests batched crash reports queued by mobile or offline clients in single transactional operations.
- **RESTful Endpoints**: Built using `@autocode-ts/ac-web` decorators (`@AcWebController`, `@AcWebRoute`, `@AcWebValueFromBody`, `@AcWebValueFromQuery`, `@AcWebValueFromPath`).
- **Triage & Analytics**: Update issue resolution status (`open`, `investigating`, `resolved`, `ignored`), query paginated exceptions, and view daily crash volume histograms.

## Installation

```bash
npm install @autocode-ts/ac-exceptor-server
```

## Quick Start

```typescript
import { AcExceptorServer } from '@autocode-ts/ac-exceptor-server';
import { AcSqliteDao } from '@autocode-ts/ac-sql-node';
import { AcWeb } from '@autocode-ts/ac-web';
import { AcSqlConnection } from '@autocode-ts/ac-sql';

const sqlConnection = new AcSqlConnection();
sqlConnection.database = './exceptions.db';

const dao = new AcSqliteDao();
dao.setSqlConnection({ sqlConnection });

const acWeb = new AcWeb();

// Initialize data dictionary, database schema, and register routes
await AcExceptorServer.initialize({
  dao,
  acWeb,
  dataDictionaryName: 'ac_exceptor_server',
});
```

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/exceptions/report` | Ingests a single exception report |
| `POST` | `/api/v1/exceptions/batch` | Ingests a batch of offline/queued exceptions |
| `GET` | `/api/v1/exceptions` | Lists grouped exceptions with pagination and filters |
| `GET` | `/api/v1/exceptions/stats/summary` | Aggregated analytics and top 10 exceptions |
| `GET` | `/api/v1/exceptions/{id}` | Gets grouped exception details and metrics |
| `GET` | `/api/v1/exceptions/{id}/occurrences` | Lists occurrences for a specific exception |
| `PATCH` | `/api/v1/exceptions/{id}/status` | Updates triage status (`open`, `investigating`, `resolved`, `ignored`) |
