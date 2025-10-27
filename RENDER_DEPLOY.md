# Deploy to Render

## Quick Deploy Steps

1. **Push to GitHub**
   - Create a new GitHub repository
   - Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/websocket-chat.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://render.com
   - Sign up/Login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: websocket-chat (or any name)
     - **Region**: Choose closest to you
     - **Branch**: main
     - **Build Command**: Leave empty (or `npm install`)
     - **Start Command**: `node server.js`
     - **Environment**: Node
   - Click "Create Web Service"

3. **Wait for Deployment**
   - Render will build and deploy your app
   - Once live, you'll get a URL like: `https://websocket-chat.onrender.com`

## Important Notes

### Database Persistence
⚠️ **WARNING**: Render uses ephemeral storage. Your SQLite database (`chat.db`) will be lost on every restart!

**Solution**: Upgrade to paid plan or use external database:
- PostgreSQL (recommended)
- MongoDB Atlas (free tier)

### Environment Variables
Add these in Render dashboard:
- `NODE_ENV=production`
- `PORT` (automatically set by Render)

### WebSocket on Render
✅ **Good news**: Render supports WebSockets on all plans!

## Files Included

- ✅ `Procfile` - Tells Render how to run your app
- ✅ `package.json` - Dependencies and scripts
- ✅ `server.js` - Main server (already uses `process.env.PORT`)
- ✅ `public/` - Frontend files

## Testing Your Deployment

1. Visit your Render URL
2. Register a new account
3. Test group chat
4. Test private messaging
5. Open multiple windows to simulate multiple users

## Troubleshooting

### Build Fails
- Check build logs in Render
- Ensure all dependencies are in `package.json`

### WebSocket Not Working
- Make sure you're using the HTTPS URL (Render provides)
- Check browser console for errors

### Database Resets
- This is expected on Render free tier
- Consider upgrading or using external database

## Next Steps (Optional)

1. **Add PostgreSQL**
   - Create PostgreSQL instance in Render
   - Update server.js to use PostgreSQL instead of SQLite

2. **Add Custom Domain**
   - Settings → Add Custom Domain
   - Point your DNS to Render

3. **Add Environment Variables**
   - For API keys, secrets, etc.

## Estimated Costs

- **Free Tier**: $0/month (but database resets on restart)
- **Starter**: $7/month (persistent storage)
- **Production**: Custom pricing

## Support

If you encounter issues:
1. Check Render logs in dashboard
2. Check browser console
3. Verify all files are pushed to GitHub
4. Contact Render support

