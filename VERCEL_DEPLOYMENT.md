# SDX Partners Intelligence Portal - Vercel Deployment Guide

## 🚀 **Production Deployment Instructions**

### **Prerequisites**
- Vercel account (free tier sufficient for testing)
- GitHub repository with latest code
- Superset instance running at `https://bi.sdxpartners.com`
- Admin token for Superset API access

### **Step 1: Prepare Repository**

1. **Push Latest Code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Verify Required Files**
   - ✅ `vercel.json` - Deployment configuration
   - ✅ `.env.production` - Environment variables template
   - ✅ `package.json` - Dependencies and build scripts
   - ✅ `server/index.js` - Backend API server

### **Step 2: Vercel Project Setup**

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `https://github.com/126aadvik/SDX.git`

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Step 3: Environment Variables**

Add these in Vercel dashboard:

```env
NODE_ENV=production
SUPERSET_URL=https://bi.sdxpartners.com
SUPERSET_ADMIN_TOKEN=your_actual_superset_token
PORT=3001
CORS_ORIGIN=https://your-app-name.vercel.app
SESSION_SECRET=your_secure_random_string_here
LOG_LEVEL=info
ENABLE_DEBUG=false
ENABLE_ANALYTICS=true
```

### **Step 4: Deploy**

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (2-3 minutes)
3. Vercel provides URL like `https://your-app-name.vercel.app`

### **Step 5: Production Data Storage**

**Current**: File-based storage (development only)
**Production Options**:

#### **Option A: Vercel KV (Redis) - Recommended**
```bash
npm install @vercel/kv
# Add KV_REST_API_URL and KV_REST_API_TOKEN to env vars
```

#### **Option B: PostgreSQL Database**
```bash
npm install pg @types/pg
# Add DATABASE_URL to env vars
```

### **Step 6: Verification Checklist**

- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Dashboard creation/viewing working
- [ ] User management working
- [ ] Charts rendering properly
- [ ] Mobile responsiveness verified

### **🔧 Troubleshooting**

**Build Failures**: Check Node.js version and dependencies
**API Issues**: Verify vercel.json routing and environment variables
**Auth Issues**: Check session secret and CORS configuration
**Chart Issues**: Verify Superset URL and token

### **🎉 Go Live**

Once checklist complete:
1. Update DNS (if custom domain)
2. Notify users
3. Monitor for issues
4. Celebrate! 🚀

---

**Support**: Check Vercel docs or contact development team for issues.
