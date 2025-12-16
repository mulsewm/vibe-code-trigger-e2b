# Vibe Code - Trigger.dev + e2b Integration

A refactored version of the Vercel Vibe Code OSS project that replaces Vercel sandbox execution with Trigger.dev workflows running on e2b sandboxes.

## Architecture

- **Frontend**: Next.js app (preserved from original)
- **Backend API**: Node.js/TypeScript with Trigger.dev SDK
- **Execution**: e2b sandboxes for isolated code execution
- **Orchestration**: Trigger.dev for workflow management

## Project Structure

```
vibe-code-trigger-e2b/
├── apps/
│   ├── web/                    # Frontend (Next.js)
│   └── api/                    # Backend with Trigger.dev integration
├── packages/
│   ├── sdk/                    # Trigger.dev client utilities
│   └── types/                  # Shared TypeScript types
├── .env.example
└── README.md
```

## Setup

### Prerequisites

- Node.js 18.x or higher
- Trigger.dev account and API key
- e2b account and API key

### Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

**TL;DR:**
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
cd apps/api && npm run trigger:dev  # Terminal 1
cd apps/api && npm run dev           # Terminal 2
cd apps/web && npm run dev           # Terminal 3
```

## Environment Variables

- `TRIGGER_API_KEY`: Your Trigger.dev API key
- `E2B_API_KEY`: Your e2b API key
- `NEXT_PUBLIC_API_URL`: API URL (default: http://localhost:3000)

## Development

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps
- `npm run type-check` - Type check all apps

## Deployment

See deployment documentation in each app's README.

