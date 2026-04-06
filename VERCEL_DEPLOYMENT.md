# Vercel Deployment Guide

## Environment Variables Setup

Your Groq API key is missing from your Vercel deployment. Follow these steps:

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Copy your API key (starts with `gsk_`)

### 2. Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click **Environment Variables** in the sidebar
4. Add the following variables:

#### Required Variables:
```
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

#### Optional AI Service Keys:
```
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the three dots next to your latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic redeployment

### 4. Verify Deployment

Check these endpoints to ensure everything works:

- Health Check: `https://your-app-name.vercel.app/api/health`
- Generate Plan: Test through your app's UI

## Common Issues & Solutions

### Issue: "GROQ_API_KEY is not set"
**Solution**: Ensure the environment variable is added in Vercel settings and the app is redeployed.

### Issue: "Invalid API key"
**Solution**: 
- Verify your Groq API key is correct
- Check if the key has expired
- Ensure you're using a Groq key (not OpenAI or other service)

### Issue: Environment variables not working
**Solution**:
- Make sure variables are added to the correct environment (Production)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

## Database Setup

If you haven't set up MongoDB:

1. **MongoDB Atlas** (Recommended):
   - Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Get connection string
   - Add `MONGODB_URI` to Vercel environment variables

2. **Render MongoDB** (Alternative):
   - Create MongoDB database on Render
   - Use the provided connection string

## Testing Your Deployment

1. Visit your deployed app
2. Try generating a study plan
3. Check browser console for any errors
4. Monitor Vercel function logs for debugging

## Next Steps

Once environment variables are set:
- Your AI features should work properly
- Study plan generation will be functional
- All API endpoints will be operational
