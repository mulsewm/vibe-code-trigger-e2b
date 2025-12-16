# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys:
   - `TRIGGER_API_KEY` - Get from https://trigger.dev
   - `E2B_API_KEY` - Get from https://e2b.dev

3. **Start Development Servers**

   Terminal 1 - Trigger.dev:
   ```bash
   cd apps/api
   npm run trigger:dev
   ```

   Terminal 2 - API Server:
   ```bash
   cd apps/api
   npm run dev
   ```

   Terminal 3 - Web App:
   ```bash
   cd apps/web
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## Getting API Keys

See **[GET_API_KEYS.md](./GET_API_KEYS.md)** for detailed step-by-step instructions.

### Quick Links:
- **Trigger.dev**: https://trigger.dev → Project Settings → API Keys
- **e2b**: https://e2b.dev/dashboard/api-keys

### Quick Steps:

**Trigger.dev:**
1. Sign up at https://trigger.dev
2. Create a new project
3. Go to Settings → API Keys
4. Copy your `TRIGGER_API_KEY`

**e2b:**
1. Sign up at https://e2b.dev
2. Go to https://e2b.dev/dashboard/api-keys
3. Click "Create API Key"
4. ⚠️ Copy immediately - you won't see it again!
5. This is your `E2B_API_KEY`

## Project Structure

```
vibe-code-trigger-e2b/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express API with Trigger.dev
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── sdk/          # Trigger.dev client utilities
└── .env.local        # Your environment variables
```

## Next Steps

- See [README.md](./README.md) for architecture details
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

