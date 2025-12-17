# 🚀 Quick Start - Deploy in 5 Minutes

The fastest way to get your Vibe Code integration live in production.

---

## Prerequisites (2 minutes)

Get these API keys ready:

1. **Trigger.dev API Key**
   - Go to https://trigger.dev/
   - Sign up/login
   - Create project or use existing
   - Copy your "Secret Key" from API Keys section

2. **e2b API Key**
   - Go to https://e2b.dev/
   - Sign up/login
   - Go to Settings → API Keys
   - Create and copy your API key

3. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

---

## Deploy (3 minutes)

### Step 1: Set Up Environment (30 seconds)

```bash
# Copy environment template
cp env.example .env.local

# Edit with your API keys
nano .env.local
```

Add your keys:
```bash
TRIGGER_API_KEY=tr_prod_xxxxx
E2B_API_KEY=e2b_xxxxx
```

### Step 2: Deploy Everything (2.5 minutes)

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

**That's it!** The script will:
- ✅ Install dependencies
- ✅ Build your project
- ✅ Deploy Trigger.dev tasks
- ✅ Deploy API to Vercel
- ✅ Deploy frontend to Vercel
- ✅ Give you live URLs

---

## Verify (30 seconds)

Open the frontend URL you received and test:

```python
print("Hello, World!")
```

Click "Run" and see it execute! 🎉

---

## Manual Deployment (if you prefer)

### Deploy Trigger.dev Tasks
```bash
cd apps/api
npx trigger.dev@latest deploy
```

### Deploy API
```bash
cd apps/api
vercel --prod

# Set environment variables
vercel env add TRIGGER_API_KEY production
vercel env add E2B_API_KEY production

# Redeploy with env vars
vercel --prod
```

### Deploy Frontend
```bash
cd apps/web
vercel --prod

# Set API URL (use URL from API deployment)
vercel env add NEXT_PUBLIC_API_URL production

# Redeploy
vercel --prod
```

---

## Troubleshooting

**Problem: "TRIGGER_API_KEY not set"**
```bash
cd apps/api
vercel env add TRIGGER_API_KEY production
vercel --prod
```

**Problem: "CORS error"**
```bash
cd apps/api
vercel env add CORS_ORIGIN production
# Enter your frontend URL
vercel --prod
```

**Problem: Script fails**
See full troubleshooting guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## What's Next?

- 📊 Monitor logs: `vercel logs vibe-code-api`
- 🔐 Add custom domain in Vercel dashboard
- 📈 Set up analytics and monitoring
- 📚 Read full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Need help?** Check the comprehensive [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

