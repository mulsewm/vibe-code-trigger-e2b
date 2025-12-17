# Vibe Code - Trigger.dev + e2b Integration

A refactored version of the Vercel Vibe Code OSS project that replaces Vercel sandbox execution with Trigger.dev workflows running on e2b sandboxes.

## Status

This project is production-ready with complete deployment automation. Deploy to production in 5 minutes using the included deployment script.

```bash
./deploy.sh
```

See QUICK_START.md or DEPLOYMENT_GUIDE.md for detailed instructions.

## Architecture

The application follows a distributed architecture with isolated execution environments:

- Frontend: Next.js application (preserved from original)
- Backend API: Node.js/TypeScript with Trigger.dev SDK
- Execution Layer: e2b sandboxes for isolated code execution
- Orchestration: Trigger.dev for workflow management

Request flow:
```
User → Frontend (Vercel) → API (Vercel) → Trigger.dev → e2b Sandbox
```

## Features

- Multi-language support: Python, JavaScript, TypeScript, Bash
- Real-time log streaming for execution output
- Isolated execution environment for each code run
- Production-ready with health checks and monitoring
- Fully automated deployment pipeline

## Project Structure

```
vibe-code-trigger-e2b/
├── apps/
│   ├── web/                       # Frontend Next.js application
│   └── api/                       # Backend with Trigger.dev integration
│       ├── src/
│       │   ├── services/
│       │   │   └── e2bExecutor.ts # Code execution engine
│       │   ├── triggers/
│       │   │   └── executeCode.ts # Trigger.dev task definition
│       │   ├── routes/
│       │   │   ├── execute.ts     # Code execution API endpoints
│       │   │   └── health.ts      # Health check endpoints
│       │   └── index.ts           # API server entry point
│       └── vercel.json            # Vercel deployment configuration
├── packages/
│   ├── sdk/                       # Trigger.dev SDK utilities
│   └── types/                     # Shared TypeScript types
├── deploy.sh                      # Automated deployment script
├── test-deployment.sh             # Deployment testing script
├── QUICK_START.md                 # 5-minute deployment guide
├── DEPLOYMENT_GUIDE.md            # Comprehensive deployment documentation
└── README.md                      # This file
```

## Local Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Trigger.dev account with API key
- e2b account with API key

### Setup

Complete setup takes approximately 2 minutes:

```bash
# Install all dependencies
npm install

# Configure environment variables
cp env.example .env.local
# Edit .env.local and add your API keys

# Start development servers (requires 3 terminal windows)
# Terminal 1: Start Trigger.dev worker
cd apps/api && npm run trigger:dev

# Terminal 2: Start API server
cd apps/api && npm run dev

# Terminal 3: Start frontend development server
cd apps/web && npm run dev
```

Access the application at http://localhost:3000

For more detailed setup instructions, see SETUP.md

## Deployment to Production

### Option 1: Automated Deployment (Recommended)

The fastest way to deploy everything to production:

```bash
# Set up environment variables
cp env.example .env.local
# Edit .env.local and add your production API keys

# Run automated deployment
./deploy.sh

# Verify deployment
./test-deployment.sh <YOUR_API_URL>
```

The script handles all configuration, builds, and deployments automatically.

### Option 2: Manual Deployment

Follow the step-by-step guide in QUICK_START.md for manual control over each deployment step.

### Option 3: Continuous Integration/Deployment

Push changes to the main branch to trigger automatic deployment via GitHub Actions. See .github/workflows/deploy.yml for configuration.

## Documentation

Deployment documentation:
- QUICK_START.md - Deploy in 5 minutes
- DEPLOYMENT_GUIDE.md - Complete deployment guide with detailed steps
- DEPLOYMENT_SUMMARY.md - Quick overview of deployment process
- VERCEL_SETUP.md - Vercel dashboard configuration
- ENV_VARS.md - Environment variable reference
- CHECKLIST.md - Pre-deployment checklist

Development documentation:
- SETUP.md - Local development setup guide
- PROJECT_SUMMARY.md - Project architecture and design decisions
- DEPLOYMENT.md - Original deployment notes and history

## Environment Variables

### Required Variables

- TRIGGER_API_KEY: Your Trigger.dev API key (obtain from https://trigger.dev/dashboard)
- E2B_API_KEY: Your e2b API key (obtain from https://e2b.dev/console)
- NEXT_PUBLIC_API_URL: Your API endpoint URL (e.g., https://your-api.vercel.app)

### Optional Variables

- PORT: API server port (default: 3001)
- CORS_ORIGIN: Allowed CORS origins (default: *)
- EXECUTION_DEFAULT_TIMEOUT: Default execution timeout in milliseconds (default: 30000)
- LOG_LEVEL: Application log level (default: info)

See ENV_VARS.md for the complete reference.

## Development Commands

Development operations:
```bash
npm run dev              # Start all development servers
npm run build            # Build all applications
npm run lint             # Run linter across all packages
npm run type-check       # Perform TypeScript type checking
```

Deployment operations:
```bash
./deploy.sh              # Deploy to production
./test-deployment.sh     # Test deployed API endpoints
```

Vercel operations:
```bash
vercel logs vibe-code-api    # View API server logs
vercel logs vibe-code-web    # View frontend logs
vercel env ls                # List environment variables
```

## API Endpoints

Code execution:
- POST /api/execute - Execute code synchronously
- GET /api/execute/:id/logs - Stream execution logs via WebSocket

Health checks:
- GET /health - Basic health check
- GET /health/detailed - Full system status report
- GET /health/ready - Readiness probe for load balancers
- GET /health/live - Liveness probe for container orchestration
- GET /health/version - Version information

## Testing

### Local Testing

```bash
# Start all development servers
npm run dev

# Open in browser
open http://localhost:3000
```

### Production Testing

```bash
# Run automated test suite
./test-deployment.sh https://your-api.vercel.app

# Manual health check
curl https://your-api.vercel.app/health

# Test code execution
curl -X POST https://your-api.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello!\")","language":"python"}'
```

## Execution Flow

The code execution process follows this sequence:

1. User submits code through the web interface
2. Frontend sends request to the API endpoint
3. API triggers a Trigger.dev task
4. Trigger.dev creates a new e2b sandbox
5. e2b executes the code in an isolated environment
6. Execution results and logs stream back to the user in real-time

## Technology Stack

Frontend:
- Next.js 16
- React 19
- TailwindCSS for styling
- Radix UI for components
- Zustand for state management

Backend:
- Node.js with TypeScript
- Express for HTTP server
- Trigger.dev SDK v4
- e2b SDK v2

Deployment:
- Vercel for hosting
- GitHub Actions for CI/CD

## Supported Languages

- Python (via python3 interpreter)
- JavaScript (via node)
- TypeScript (via tsx compiler)
- Bash (via shell execution)

## Monitoring and Logs

Dashboard access:
- Vercel Dashboard: https://vercel.com/dashboard
- Trigger.dev Dashboard: https://trigger.dev/
- e2b Console: https://e2b.dev/

View application logs:
```bash
# Real-time log streaming
vercel logs vibe-code-api --follow
vercel logs vibe-code-web --follow

# View recent logs
vercel logs vibe-code-api
```

## Troubleshooting

### TRIGGER_API_KEY not set

```bash
vercel env add TRIGGER_API_KEY production
vercel --prod
```

### e2b sandbox creation failed

- Verify your e2b dashboard has available credits
- Confirm your e2b API key is correct
- Check e2b account status and limits

### CORS errors in browser console

```bash
vercel env add CORS_ORIGIN production
# Enter your frontend URL when prompted
vercel --prod
```

For comprehensive troubleshooting, see DEPLOYMENT_GUIDE.md

## Contributing

This is a refactored version of Vercel's Vibe Code OSS project. The original project was created by @komiljon-ocapital and the Vercel team.

## Resources

- Trigger.dev Documentation: https://trigger.dev/docs
- e2b Documentation: https://e2b.dev/docs
- Vercel Documentation: https://vercel.com/docs
- Original Vibe Code: https://github.com/vercel-labs/vibe-code

## License

MIT License

## Getting Started

To get started:

1. Local Development: Follow SETUP.md for development environment setup
2. Production Deployment: Run ./deploy.sh or follow QUICK_START.md

For questions or issues, open an issue in the repository or refer to the relevant documentation file.

Built using Trigger.dev and e2b.
