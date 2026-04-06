# Deploy to Render

This guide will help you deploy your Animated Research Assistant to Render with both web and database services.

## Prerequisites

1. A Render account (free tier available)
2. GitHub repository with your code
3. API keys for external services

## Quick Deployment

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect and use the `render.yaml` file

### Option 2: Manual Setup

#### Web Service Setup

1. **Create Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: animated-research-assistant
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or your preferred plan)

2. **Environment Variables**
   Add these environment variables in your web service settings:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app-name.onrender.com
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   GROQ_API_KEY=your_groq_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

#### Database Setup

1. **Create MongoDB Database**
   - Go to Render Dashboard → New → Database
   - Choose MongoDB
   - **Name**: animated-research-assistant-db
   - **Plan**: Free (or your preferred plan)

2. **Get Connection String**
   - Once created, go to database settings
   - Copy the external connection string
   - Add it as `MONGODB_URI` in your web service environment variables

## Environment Variables Explained

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your deployed app URL
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `GOOGLE_API_KEY`: Google API key for Gemini AI
- `GROQ_API_KEY`: Groq API key for fast AI inference
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for notifications

## Post-Deployment Checklist

- [ ] Verify the health endpoint: `https://your-app.onrender.com/api/health`
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Test file upload functionality
- [ ] Verify AI features are working
- [ ] Test authentication flow

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires >=18.0.0)
   - Verify all dependencies are installed
   - Check for any TypeScript errors

2. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check if database is running
   - Ensure IP whitelist allows Render connections

3. **API Key Issues**
   - Verify all API keys are set correctly
   - Check if API keys have proper permissions
   - Ensure API services are active

### Logs and Monitoring

- Access logs in Render Dashboard
- Monitor build logs for deployment issues
- Check service logs for runtime errors

## Scaling Considerations

- **Free Plan Limitations**: 
  - 750 hours/month
  - Auto-suspension after 15 minutes inactivity
  - Limited resources

- **Production Recommendations**:
  - Upgrade to Starter plan for better performance
  - Set up monitoring and alerts
  - Configure custom domain
  - Set up SSL certificates

## Custom Domain (Optional)

1. Upgrade to a paid plan
2. Go to your service settings
3. Add your custom domain
4. Update DNS records as instructed by Render
5. Update `NEXTAUTH_URL` environment variable

## Support

- Render Documentation: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- MongoDB on Render: https://render.com/docs/databases-mongodb
