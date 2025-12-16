# Deployment Guide

## Prerequisites

1. **Trigger.dev Account**
   - Sign up at https://trigger.dev
   - Create a new project
   - Get your API key from the dashboard

2. **e2b Account**
   - Sign up at https://e2b.dev
   - Get your API key from the dashboard

3. **Vercel Account** (for deployment)
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

## Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd vibe-code-trigger-e2b
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` in the root directory:
   ```env
   TRIGGER_API_KEY=your_trigger_dev_key
   E2B_API_KEY=your_e2b_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   API_URL=http://localhost:3001
   ```

3. **Run Trigger.dev Dev Server**
   ```bash
   cd apps/api
   npm run trigger:dev
   ```

4. **Run API Server**
   In a new terminal:
   ```bash
   cd apps/api
   npm run dev
   ```

5. **Run Frontend**
   In another terminal:
   ```bash
   cd apps/web
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## Vercel Deployment

### Option 1: Deploy Both Apps to Vercel

1. **Deploy API**
   ```bash
   cd apps/api
   vercel
   ```
   - Set environment variables in Vercel dashboard
   - Note the deployment URL

2. **Deploy Web**
   ```bash
   cd apps/web
   vercel
   ```
   - Set `NEXT_PUBLIC_API_URL` to your API deployment URL

### Option 2: Monorepo Deployment

1. **Root Deployment**
   ```bash
   vercel
   ```
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `apps/web/.next`

2. **Environment Variables**
   Set in Vercel dashboard:
   - `TRIGGER_API_KEY`
   - `E2B_API_KEY`
   - `NEXT_PUBLIC_API_URL` (your API URL)
   - `API_URL` (your API URL)

## Trigger.dev Deployment

1. **Deploy Workflows**
   ```bash
   cd apps/api
   npx trigger.dev@latest deploy
   ```

2. **Configure Environment**
   - Set environment variables in Trigger.dev dashboard
   - Link your Trigger.dev project

## Environment Variables Reference

### API Server (`apps/api`)
- `TRIGGER_API_KEY` - Trigger.dev API key (required)
- `E2B_API_KEY` - e2b API key (required)
- `PORT` - API server port (default: 3001)
- `TRIGGER_API_URL` - Trigger.dev API URL (optional)

### Web App (`apps/web`)
- `NEXT_PUBLIC_API_URL` - API server URL (required)

## Troubleshooting

### Common Issues

1. **Trigger.dev Connection Failed**
   - Verify `TRIGGER_API_KEY` is correct
   - Check Trigger.dev dashboard for project status
   - Ensure Trigger.dev dev server is running locally

2. **e2b Sandbox Creation Failed**
   - Verify `E2B_API_KEY` is correct
   - Check e2b account quota/limits
   - Ensure network connectivity

3. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` matches your API deployment
   - Check CORS settings in API server
   - Verify API server is running

## Production Checklist

- [ ] All environment variables set
- [ ] Trigger.dev workflows deployed
- [ ] API server deployed and accessible
- [ ] Frontend deployed with correct API URL
- [ ] CORS configured correctly
- [ ] Error monitoring set up
- [ ] Rate limiting configured
- [ ] Security headers configured

