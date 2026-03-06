# Deploying to Vercel

Deploy Nova completely to Vercel (both backend and frontend).

## Prerequisites

- Vercel account ([sign up here](https://vercel.com/signup))
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

## Step 1: Deploy Backend to Railway

### Via Railway Dashboard (Recommended)
Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository: `Raghahahav/ILikeITBlack`
3. Configure:
   - **Project Name**: `nova-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Install Command**: `pip install -r requirements.txt`

4. Add Environment Variables (click "Environment Variables"):
   ```
   OPENROUTER_API_KEY = sk-or-v1-your-key-here
   MODEL_NAME = anthropic/claude-3-haiku
   CORS_ORIGINS = *
   ```

5. Click **"Deploy"**
6. Once deployed, copy your backend URL (e.g., `https://nova-backend-xxx.vercel.app`)
### Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository: `Raghahahav/ILikeITBlack`
3. Configure:
   - **Project Name**: `nova` or `nova-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:

   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```

5. Click **"Deploy"**
6. Visit your live site!

### Via Vercel CLI (Alternative)

```bash
cd frontend
vercel --prod
```

## Why Railway for Backend?

✅ **No timeout limits** - Long LLM responses work perfectly
✅ **Persistent storage** - File uploads and vector store persist
✅ **Always-on** - True server, not serverless functions
✅ **Better for RAG** - Real file system access
✅ **Cost-effective** - $5/month for 500 hours execution time

## Post-Deployment

After deployment:

1. Visit your frontend URL
2. Open Settings (⚙️ icon)
3. Enter your OpenRouter API key (if not set in Railway)
4. Start chatting!

## Troubleshooting

**Railway deployment fails**:

- Check logs in Railway dashboard
- Verify `requirements.txt` is complete
- Ensure Python 3.9+ is used

**Frontend can't connect to backend**:

- Check `VITE_API_URL` in Vercel environment variables
- Verify Railway backend is running (check logs)
- Ensure `CORS_ORIGINS=*` is set in Railway

**Document uploads fail**:

- Railway provides persistent storage by default
- Check Railway logs for errors
- Verify `UPLOAD_DIR` and `VECTOR_STORE_PATH` are writable

**Slow responses**:

- Use faster models (Claude Haiku, GPT-3.5)
- Reduce `max_iterations` in `agent.py`
- Check OpenRouter API status

## Environment Variables Reference

### Railway (Backend)

| Variable             | Value                      | Required               |
| -------------------- | -------------------------- | ---------------------- |
| `OPENROUTER_API_KEY` | Your OpenRouter API key    | ✅ Yes                 |
| `MODEL_NAME`         | `anthropic/claude-3-haiku` | No (has default)       |
| `CORS_ORIGINS`       | `*`                        | No (but recommended)   |
| `PORT`               | `8000`                     | No (Railway auto-sets) |

### Vercel (Frontend)

| Variable       | Value               | Required |
| -------------- | ------------------- | -------- |
| `VITE_API_URL` | Railway backend URL | ✅ Yes   |

## Cost Estimates

- **Railway**: $5/month (Hobby plan, 500 hours)
- **Vercel**: Free (Hobby plan, sufficient for most use)
- **OpenRouter**: Pay per token (varies by model)

**Total**: ~$5-10/month for personal use

- Use external storage (S3) or deploy backend elsewhere
