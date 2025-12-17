#  Production Deployment Guide

Complete guide to deploy **Vibe Code + Trigger.dev + e2b** to production.

---

##  Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Variables](#environment-variables)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

##  Quick Start

For experienced users, here's the TL;DR:

```bash
# 1. Get API keys
# - Trigger.dev: https://trigger.dev/ → API Keys
# - e2b: https://e2b.dev/ → Settings → API Keys

# 2. Install Vercel CLI
npm install -g vercel

# 3. Set up environment
cp env.example .env.local
# Edit .env.local with your keys

# 4. Deploy everything
./deploy.sh

# Or manually:
cd apps/api && npx trigger.dev@latest deploy
cd apps/api && vercel --prod
cd apps/web && vercel --prod
```

---

##  Prerequisites

### 1. **API Keys** (Get these first!)

| Service | Sign Up | Get API Key | Notes |
|---------|---------|-------------|-------|
| **Trigger.dev** | https://trigger.dev/ | Dashboard → API Keys | Use "Secret Key" (starts with `tr_`) |
| **e2b** | https://e2b.dev/ | Settings → API Keys | Get production key |
| **Vercel** | https://vercel.com/ | Settings → Tokens | Optional, CLI will handle auth |

### 2. **Tools**

```bash
# Node.js 18+ (check version)
node --version  # Should be >= 18.x

# Install Vercel CLI
npm install -g vercel

# Verify installation
vercel --version
```

### 3. **GitHub Repository** (Optional but recommended)

```bash
# Initialize git if not already
git init

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/mulsewm/vibe-code-trigger-e2b.git

# Push code
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## 🛠️ Step-by-Step Deployment

### **Step 1: Configure Environment Variables**

Create your local environment file:

```bash
# Copy the example file
cp env.example .env.local

# Open and edit with your keys
nano .env.local  # or use your favorite editor
```

**Required values in `.env.local`:**

```bash
# Trigger.dev - Get from https://trigger.dev/
TRIGGER_API_KEY=tr_prod_xxxxxxxxxxxxx

# e2b - Get from https://e2b.dev/
E2B_API_KEY=e2b_xxxxxxxxxxxxx

# These will be updated after deployment
NEXT_PUBLIC_API_URL=http://localhost:3001  # Update after API deployment
```

---

### **Step 2: Install Dependencies**

```bash
# Install all dependencies
npm install

# Verify everything builds
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Build completed in XX.XXs
```

---

### **Step 3: Deploy Trigger.dev Tasks**

```bash
cd apps/api

# Login to Trigger.dev (first time only)
npx trigger.dev@latest login

# Deploy your tasks
npx trigger.dev@latest deploy
```

You'll see:
```
✓ Deploying to project: proj_aedukktxrkvcyyazzdxz
✓ Uploaded tasks
✓ Deployment successful
```

**Verify in Trigger.dev Dashboard:**
1. Go to https://trigger.dev/
2. Open your project: `proj_aedukktxrkvcyyazzdxz`
3. Check "Tasks" tab - you should see `execute-code`

---

### **Step 4: Deploy API Backend to Vercel**

```bash
cd apps/api

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

**During deployment, you'll be asked:**
```
? Set up and deploy "~/vibe-code-trigger-e2b/apps/api"? [Y/n] y
? Which scope? [Select your account]
? Link to existing project? [N/y] n
? What's your project's name? vibe-code-api
? In which directory is your code located? ./
```

**After deployment:**
```
✓ Production: https://vibe-code-api-xxxxx.vercel.app [copied to clipboard]
```

** IMPORTANT:** Copy this URL! You'll need it for the frontend.

**Set Environment Variables in Vercel:**

```bash
# Add Trigger.dev key
vercel env add TRIGGER_API_KEY production
# Paste your key when prompted

# Add e2b key
vercel env add E2B_API_KEY production
# Paste your key when prompted

# Redeploy to apply changes
vercel --prod
```

Or use the Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select `vibe-code-api` project
3. Go to Settings → Environment Variables
4. Add:
   - `TRIGGER_API_KEY` = `tr_prod_xxxxx`
   - `E2B_API_KEY` = `e2b_xxxxx`
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*` (will update after frontend deployment)

---

### **Step 5: Deploy Frontend to Vercel**

```bash
cd apps/web

# Deploy to production
vercel --prod
```

**During deployment:**
```
? Set up and deploy "~/vibe-code-trigger-e2b/apps/web"? [Y/n] y
? Which scope? [Select your account]
? Link to existing project? [N/y] n
? What's your project's name? vibe-code-web
? In which directory is your code located? ./
```

**After deployment:**
```
✓ Production: https://vibe-code-web-xxxxx.vercel.app
```

**Set Environment Variables in Vercel:**

```bash
# Add API URL (use the URL from Step 4)
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://vibe-code-api-xxxxx.vercel.app

# Redeploy to apply changes
vercel --prod
```

---

### **Step 6: Update CORS Settings**

Now that you have both URLs, update the API's CORS settings:

```bash
cd apps/api

# Add CORS origin
vercel env add CORS_ORIGIN production
# Enter: https://vibe-code-web-xxxxx.vercel.app

# Redeploy API
vercel --prod
```

---

### **Step 7: Verify Deployment**

Test your deployment:

```bash
# Test API health
curl https://vibe-code-api-xxxxx.vercel.app/api/health

# Expected: {"status":"ok","timestamp":1234567890}
```

Open your frontend:
```
https://vibe-code-web-xxxxx.vercel.app
```

**Test code execution:**
1. Enter Python code: `print("Hello, World!")`
2. Click "Run"
3. You should see output in real-time

---

## 🔐 Environment Variables Reference

### **API (`apps/api`)**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TRIGGER_API_KEY` | ✅ Yes | Trigger.dev API key | `tr_prod_xxxxx` |
| `TRIGGER_SECRET_KEY` | ✅ Yes | Same as TRIGGER_API_KEY | `tr_prod_xxxxx` |
| `E2B_API_KEY` | ✅ Yes | e2b API key | `e2b_xxxxx` |
| `CORS_ORIGIN` | ⚠️ Recommended | Allowed frontend URL | `https://your-app.vercel.app` |
| `NODE_ENV` | ⚠️ Auto-set | Environment | `production` |
| `PORT` | ❌ Optional | Server port | `3001` |

### **Frontend (`apps/web`)**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | API backend URL | `https://vibe-code-api-xxxxx.vercel.app` |

---

## 🔄 Deployment Options

### **Option A: Automated Script** (Recommended)

Use the provided deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Validate environment variables
- ✅ Build project
- ✅ Deploy Trigger.dev tasks
- ✅ Deploy API to Vercel
- ✅ Deploy frontend to Vercel
- ✅ Provide you with all URLs

---

### **Option B: Manual Deployment** (More control)

Follow Steps 1-7 above manually.

---

### **Option C: CI/CD with GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy Trigger.dev
        run: |
          cd apps/api
          npx trigger.dev@latest deploy
        env:
          TRIGGER_API_KEY: ${{ secrets.TRIGGER_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

**Setup GitHub Secrets:**
1. Go to GitHub repo → Settings → Secrets
2. Add:
   - `TRIGGER_API_KEY`
   - `E2B_API_KEY`
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`

---

## ✅ Post-Deployment Verification

### **1. Test API Endpoints**

```bash
# Health check
curl https://your-api.vercel.app/api/health

# Execute Python code
curl -X POST https://your-api.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python"
  }'

# Execute JavaScript code
curl -X POST https://your-api.vercel.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello, World!\")",
    "language": "javascript"
  }'
```

---

### **2. Test Frontend**

1. Open `https://your-web.vercel.app`
2. Test each language:
   - Python: `print("Hello!")`
   - JavaScript: `console.log("Hello!")`
   - TypeScript: `const x: number = 42; console.log(x);`
   - Bash: `echo "Hello!"`
3. Verify:
   - ✅ Code executes successfully
   - ✅ Logs stream in real-time
   - ✅ Errors are displayed properly
   - ✅ Syntax highlighting works

---

### **3. Monitor Logs**

**Vercel Logs:**
```bash
# API logs
vercel logs vibe-code-api --prod

# Web logs
vercel logs vibe-code-web --prod
```

**Trigger.dev Dashboard:**
1. Go to https://trigger.dev/
2. Select your project
3. Go to "Runs" tab
4. You should see recent executions

**e2b Dashboard:**
1. Go to https://e2b.dev/
2. Check "Usage" tab
3. Verify sandboxes are being created/destroyed

---

## 🐛 Troubleshooting

### **Issue: "TRIGGER_API_KEY not set"**

**Solution:**
```bash
cd apps/api
vercel env add TRIGGER_API_KEY production
# Paste your key
vercel --prod  # Redeploy
```

---

### **Issue: "e2b sandbox creation failed"**

**Possible causes:**
1. Invalid API key
2. Out of credits
3. Rate limit exceeded

**Solution:**
```bash
# Check e2b dashboard: https://e2b.dev/
# Verify:
# - API key is correct
# - Account has credits
# - No rate limits hit

# Update key in Vercel
cd apps/api
vercel env add E2B_API_KEY production
vercel --prod
```

---

### **Issue: "CORS error" when calling API**

**Solution:**
```bash
cd apps/api
vercel env add CORS_ORIGIN production
# Enter your frontend URL: https://vibe-code-web-xxxxx.vercel.app
vercel --prod
```

---

### **Issue: "Code execution timeout"**

**Solution:**

Increase timeout in Vercel:

```json
// apps/api/vercel.json
{
  "functions": {
    "src/index.ts": {
      "maxDuration": 300  // 5 minutes (Vercel Pro required for >60s)
    }
  }
}
```

---

### **Issue: "Module not found" errors**

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build

# Redeploy
vercel --prod
```

---

### **Issue: Frontend can't connect to API**

**Check:**
1. API is deployed and accessible
2. `NEXT_PUBLIC_API_URL` is set correctly
3. CORS is configured

**Solution:**
```bash
# Verify API URL
curl https://your-api.vercel.app/api/health

# Update frontend env
cd apps/web
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api.vercel.app
vercel --prod
```

---

## 📊 Monitoring & Maintenance

### **Set Up Monitoring**

#### **Option 1: Vercel Analytics**

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Analytics" tab
4. Enable analytics

#### **Option 2: Sentry (Error Tracking)**

```bash
# Install Sentry
npm install --save @sentry/nextjs @sentry/node

# Initialize
npx @sentry/wizard -i nextjs
```

Add to `apps/api/src/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### **Option 3: Custom Monitoring**

Create a health check endpoint that monitors:
- Trigger.dev connection
- e2b API availability
- Database (if added)

---

### **Automated Backups**

No database in current setup, but if you add one:

```bash
# Add to package.json scripts
"backup": "pg_dump $DATABASE_URL > backup.sql"

# Schedule with cron or GitHub Actions
```

---

### **Update Dependencies**

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Or use npm-check-updates
npx npm-check-updates -u
npm install

# Test locally
npm run dev

# If all good, deploy
vercel --prod
```

---

## 🔄 Redeployment & Updates

### **Deploy Code Changes**

```bash
# Make your changes
# ...

# Build and test locally
npm run build
npm run dev

# Commit and push
git add .
git commit -m "Your changes"
git push

# Deploy
vercel --prod
```

### **Deploy Trigger.dev Changes Only**

```bash
cd apps/api
npx trigger.dev@latest deploy
```

### **Rollback to Previous Version**

```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

---

##  Success Checklist

- [ ] API deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Trigger.dev tasks deployed
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Code execution works (Python, JS, TS, Bash)
- [ ] Real-time logs streaming
- [ ] Error handling works
- [ ] Monitoring set up
- [ ] Alerts configured

---

## 📞 Support & Resources

**Documentation:**
- Trigger.dev: https://trigger.dev/docs
- e2b: https://e2b.dev/docs
- Vercel: https://vercel.com/docs

**Dashboards:**
- Trigger.dev: https://trigger.dev/
- e2b: https://e2b.dev/
- Vercel: https://vercel.com/dashboard

**Get Help:**
- GitHub Issues: [your-repo]/issues
- Trigger.dev Discord: https://discord.gg/triggerdotdev
- e2b Discord: https://discord.gg/9M4S8XBz

---

## 🚀 What's Next?

1. **Add Custom Domains**
   - Configure in Vercel Dashboard
   - Update CORS settings

2. **Add Authentication**
   - Implement API keys
   - Add rate limiting per user

3. **Add More Languages**
   - Go, Rust, Java, etc.
   - Update `prepareCode` in e2bExecutor

4. **Add File Upload**
   - Allow users to upload files
   - Execute with project context

5. **Add Database**
   - Store execution history
   - User accounts and preferences

---

**You're live! 🎉** If you followed all steps, your Vibe Code integration is now running in production!

