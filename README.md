# Vibe Code - Trigger.dev + e2b Integration

A refactored version of the Vercel Vibe Code OSS project that replaces Vercel sandbox execution with Trigger.dev workflows running on e2b sandboxes.

## 🚀 **Ready to Deploy!**

This project comes with complete deployment automation. You can deploy to production in 5 minutes!

**Quick Deploy:**
```bash
./deploy.sh
```

**See:** [QUICK_START.md](./QUICK_START.md) or [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Architecture

- **Frontend**: Next.js app (preserved from original)
- **Backend API**: Node.js/TypeScript with Trigger.dev SDK
- **Execution**: e2b sandboxes for isolated code execution
- **Orchestration**: Trigger.dev for workflow management

```
User → Frontend (Vercel) → API (Vercel) → Trigger.dev → e2b Sandbox
```

## Features

✅ **Multi-Language Support**: Python, JavaScript, TypeScript, Bash  
✅ **Real-Time Logs**: Stream execution output live  
✅ **Isolated Execution**: Each run in secure e2b sandbox  
✅ **Production Ready**: Health checks, monitoring, error handling  
✅ **Fully Automated**: One-command deployment  

## Project Structure

```
vibe-code-trigger-e2b/
├── apps/
│   ├── web/                       # Frontend (Next.js)
│   └── api/                       # Backend with Trigger.dev
│       ├── src/
│       │   ├── services/
│       │   │   └── e2bExecutor.ts # Code execution engine
│       │   ├── triggers/
│       │   │   └── executeCode.ts # Trigger.dev task
│       │   ├── routes/
│       │   │   ├── execute.ts     # API routes
│       │   │   └── health.ts      # Health checks
│       │   └── index.ts           # API server
│       └── vercel.json            # Deployment config
├── packages/
│   ├── sdk/                       # Trigger.dev utilities
│   └── types/                     # Shared types
├── deploy.sh                      # Automated deployment
├── test-deployment.sh             # Testing script
├── QUICK_START.md                 # 5-minute deploy guide
├── DEPLOYMENT_GUIDE.md            # Comprehensive guide
└── README.md                      # This file
```

## Quick Start - Local Development

### Prerequisites

- Node.js 18.x or higher
- Trigger.dev account and API key
- e2b account and API key

### Setup (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.example .env.local
# Edit .env.local with your API keys

# 3. Start development
cd apps/api && npm run trigger:dev  # Terminal 1
cd apps/api && npm run dev           # Terminal 2
cd apps/web && npm run dev           # Terminal 3
```

**Access:** http://localhost:3000

**Details:** See [SETUP.md](./SETUP.md)

---

## Deployment to Production

### Option 1: Automated Script (Recommended ⚡)

```bash
# 1. Set up environment
cp env.example .env.local
# Add your API keys to .env.local

# 2. Deploy everything
./deploy.sh

# 3. Test deployment
./test-deployment.sh <YOUR_API_URL>
```

**Done!** You'll get live URLs for your app.

### Option 2: Manual Deployment

Follow the step-by-step guide: **[QUICK_START.md](./QUICK_START.md)**

### Option 3: GitHub Actions (CI/CD)

Push to `main` branch for automatic deployment.

See: **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)**

---

## 📚 Documentation

### Deployment Docs
- **[QUICK_START.md](./QUICK_START.md)** - Deploy in 5 minutes
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete guide (745 lines)
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Overview
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Dashboard configuration
- **[ENV_VARS.md](./ENV_VARS.md)** - Environment variables
- **[CHECKLIST.md](./CHECKLIST.md)** - Deployment checklist

### Development Docs
- **[SETUP.md](./SETUP.md)** - Local development setup
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Original deployment notes

---

## Environment Variables

### Required
- `TRIGGER_API_KEY`: Trigger.dev API key ([get here](https://trigger.dev/))
- `E2B_API_KEY`: e2b API key ([get here](https://e2b.dev/))
- `NEXT_PUBLIC_API_URL`: API URL (e.g., `https://your-api.vercel.app`)

### Optional
- `PORT`: API server port (default: 3001)
- `CORS_ORIGIN`: Allowed origins (default: `*`)
- `EXECUTION_DEFAULT_TIMEOUT`: Default timeout in ms (default: 30000)

**Full reference:** [ENV_VARS.md](./ENV_VARS.md)

---

## Development Commands

```bash
# Development
npm run dev              # Start all apps
npm run build            # Build all apps
npm run lint             # Lint all apps
npm run type-check       # Type check all apps

# Deployment
./deploy.sh              # Deploy to production
./test-deployment.sh     # Test deployed API

# Vercel
vercel logs vibe-code-api    # View API logs
vercel logs vibe-code-web    # View web logs
vercel env ls                # List environment variables
```

---

## API Endpoints

### Execution
- `POST /api/execute` - Execute code synchronously
- `GET /api/execute/:id/logs` - Stream execution logs

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Full system status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/version` - Version information

---

## Testing

### Local Testing
```bash
# Start dev servers
npm run dev

# Test in browser
open http://localhost:3000
```

### Production Testing
```bash
# Automated tests
./test-deployment.sh https://your-api.vercel.app

# Manual health check
curl https://your-api.vercel.app/health

# Test code execution
curl -X POST https://your-api.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello!\")","language":"python"}'
```

---

## Architecture Details

### Code Execution Flow

1. **User** enters code in web interface
2. **Frontend** sends request to API
3. **API** triggers Trigger.dev task
4. **Trigger.dev** creates e2b sandbox
5. **e2b** executes code in isolated environment
6. **Results** stream back to user in real-time

### Tech Stack

**Frontend:**
- Next.js 16
- React 19
- TailwindCSS
- Radix UI
- Zustand (state management)

**Backend:**
- Node.js + TypeScript
- Express
- Trigger.dev SDK v4
- e2b SDK v2

**Deployment:**
- Vercel (serverless)
- GitHub Actions (CI/CD)

---

## Supported Languages

- 🐍 **Python** - Via `python3`
- 📜 **JavaScript** - Via `node`
- 📘 **TypeScript** - Via `tsx`
- 🐚 **Bash** - Via shell execution

---

## Monitoring & Logs

### Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Trigger.dev:** https://trigger.dev/
- **e2b:** https://e2b.dev/

### View Logs
```bash
# Real-time logs
vercel logs vibe-code-api --follow
vercel logs vibe-code-web --follow

# Recent logs
vercel logs vibe-code-api
```

---

## Troubleshooting

### Common Issues

**"TRIGGER_API_KEY not set"**
```bash
vercel env add TRIGGER_API_KEY production
vercel --prod
```

**"e2b sandbox creation failed"**
- Check e2b dashboard for credits
- Verify API key is correct

**"CORS error"**
```bash
vercel env add CORS_ORIGIN production
# Enter your frontend URL
vercel --prod
```

**Full troubleshooting:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)

---

## Contributing

This is a refactored version of Vercel's Vibe Code OSS project. Original project by [@komiljon-ocapital](https://github.com/komiljon-ocapital).

---

## Resources

- **Trigger.dev Docs:** https://trigger.dev/docs
- **e2b Docs:** https://e2b.dev/docs
- **Vercel Docs:** https://vercel.com/docs
- **Original Vibe Code:** https://github.com/vercel-labs/vibe-code

---

## License

MIT

---

## 🚀 Get Started

**Local Development:** [SETUP.md](./SETUP.md)  
**Deploy to Production:** [QUICK_START.md](./QUICK_START.md) or run `./deploy.sh`

**Questions?** Check the [documentation](#-documentation) or open an issue.

---

**Built with ❤️ using Trigger.dev + e2b**

