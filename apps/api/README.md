# Vibe Code API

Backend API server with Trigger.dev and e2b integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see `.env.example`)

3. Run Trigger.dev dev server:
   ```bash
   npm run trigger:dev
   ```

4. Run API server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/execute` - Execute code
- `GET /api/execute/:executionId` - Get execution status
- `GET /api/execute/:executionId/logs` - Stream execution logs (SSE)

