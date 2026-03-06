# Deploying to Vercel

Nova can be deployed to Vercel in two parts: backend and frontend.

## Prerequisites

- Vercel account ([sign up here](https://vercel.com/signup))
- Vercel CLI: `npm install -g vercel`
- OpenRouter API key

## Option 1: Deploy via Vercel CLI

### 1. Deploy Backend

```bash
cd backend
vercel --prod
```

When prompted:

- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **nova-backend** (or your choice)
- Directory? **./backend**
- Override settings? **N**

After deployment, note the backend URL (e.g., `https://nova-backend.vercel.app`)

### 2. Configure Backend Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables, add:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MODEL_NAME=anthropic/claude-3-haiku
CORS_ORIGINS=*
```

### 3. Deploy Frontend

Update `.env.production` with your backend URL:

```env
VITE_API_URL=https://your-backend-url.vercel.app
```

Then deploy:

```bash
cd frontend
vercel --prod
```

## Option 2: Deploy via GitHub (Recommended)

### 1. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will detect two deployable directories

### 2. Deploy Backend

- **Project Name**: `nova-backend`
- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Environment Variables**:
  - `OPENROUTER_API_KEY`: Your OpenRouter key
  - `MODEL_NAME`: `anthropic/claude-3-haiku`
  - `CORS_ORIGINS`: `*`

Click **Deploy**

### 3. Deploy Frontend

Import the same repo again:

- **Project Name**: `nova` or `nova-frontend`
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your backend URL from step 2

Click **Deploy**

## Important Notes

⚠️ **Limitations**:

- Vercel serverless functions have a 10-second execution limit (Hobby) / 60s (Pro)
- File uploads are limited to 4.5MB (use external storage for production)
- `/tmp` storage is ephemeral (uploaded documents won't persist between requests)

💡 **For production RAG**:

- Use a persistent vector database (Pinecone, Weaviate, Qdrant)
- Store documents in S3/CloudFlare R2
- Consider deploying backend to Railway/Render/Fly.io for long-running processes

## Alternative: Single Vercel Deployment

You can deploy just the frontend to Vercel and run the backend elsewhere:

1. Deploy backend to: Railway, Render, Fly.io, or DigitalOcean
2. Update `frontend/.env.production` with the backend URL
3. Deploy frontend to Vercel

## Post-Deployment

After deployment:

1. Visit your frontend URL
2. Open Settings (⚙️ icon)
3. Enter your OpenRouter API key (if not set in backend)
4. Start chatting!

## Troubleshooting

**Backend timeout errors**:

- Reduce `max_iterations` in `agent.py`
- Use faster models (Claude Haiku, GPT-3.5)
- Increase Vercel timeout (Pro plan)

**CORS errors**:

- Set `CORS_ORIGINS=*` in backend environment variables
- Or set specific frontend URL: `CORS_ORIGINS=https://your-frontend.vercel.app`

**Document uploads fail**:

- Vercel serverless functions have size limits
- Use external storage (S3) or deploy backend elsewhere
