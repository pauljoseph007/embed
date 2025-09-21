# Superset Integration Guide

## 🎯 Current Status

✅ **Backend API**: Working correctly (port 3001)  
✅ **Frontend**: Loading Superset SDK successfully  
✅ **Connection**: Successfully connecting to https://bi.sdxpartners.com  
✅ **Authentication**: Admin token is valid and working  
❌ **Dashboard Embedding**: Needs configuration in Superset  

## 🔧 Required Superset Configuration

### 1. Enable Embedded Superset Feature

Add to your `superset_config.py`:

```python
# Enable embedded superset
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    # ... other feature flags
}

# CORS configuration for embedding
ENABLE_CORS = True
CORS_OPTIONS = {
    'origins': [
        'http://localhost:8080',
        'http://localhost:8081', 
        'http://localhost:8082',
        'http://localhost:8083',
        'http://localhost:8084',
        'http://localhost:8085',
        'https://portal.sdxpartners.com'
    ],
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization', 'X-Requested-With'],
    'supports_credentials': True
}

# Content Security Policy for iframe embedding
CONTENT_SECURITY_POLICY_WARNING = False
TALISMAN_ENABLED = True
TALISMAN_CONFIG = {
    "content_security_policy": {
        "frame-ancestors": [
            "'self'",
            "http://localhost:8080",
            "http://localhost:8081", 
            "http://localhost:8082",
            "http://localhost:8083",
            "http://localhost:8084",
            "http://localhost:8085",
            "https://portal.sdxpartners.com"
        ]
    }
}

# Guest token configuration
GUEST_TOKEN_JWT_SECRET = 'your-secret-key-here'
GUEST_TOKEN_JWT_ALGO = 'HS256'
GUEST_TOKEN_JWT_EXP_SECONDS = 3600  # 1 hour
```

### 2. Configure Dashboard for Embedding

For each dashboard you want to embed:

1. **Open the dashboard** in Superset
2. **Click "Edit dashboard"**
3. **Go to "Settings" → "Advanced"**
4. **Enable "Embeddable"** checkbox
5. **Add allowed domains**:
   - `http://localhost:8082` (development)
   - `https://portal.sdxpartners.com` (production)
6. **Save the dashboard**

### 3. Set Up Guest User Permissions

```sql
-- Create or update the guest role with proper permissions
-- This should be done through Superset UI or via API

-- Ensure the guest role can:
-- 1. Access the specific dashboards
-- 2. View charts within those dashboards
-- 3. Execute queries (if needed)
```

### 4. Test Dashboard IDs

To find valid dashboard IDs:

1. **Go to Dashboards list** in Superset
2. **Click on a dashboard**
3. **Check the URL**: `/superset/dashboard/{ID}/`
4. **Use that ID** in the portal

Common dashboard URLs:
- `https://bi.sdxpartners.com/superset/dashboard/1/` → ID: `1`
- `https://bi.sdxpartners.com/superset/dashboard/5/` → ID: `5`

## 🧪 Testing the Integration

### 1. Backend API Test

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test Superset connection
curl http://localhost:3001/api/test-superset-connection

# Test guest token (replace ID with valid dashboard)
curl -X POST http://localhost:3001/api/get-guest-token \
  -H "Content-Type: application/json" \
  -d '{"embedId":"1","embedType":"dashboard"}'
```

### 2. Frontend Debug Page

Visit: http://localhost:8082/debug

This page provides:
- ✅ Backend connection status
- ✅ Superset SDK availability
- ✅ Guest token testing
- ✅ Live chart embedding test

### 3. Expected Results

**Successful Integration:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-09-10T13:01:49.260Z",
  "resource_type": "dashboard",
  "resource_id": "1"
}
```

**Common Errors:**
- `"EmbeddedDashboard not found"` → Dashboard not configured for embedding
- `"Invalid dashboard ID"` → Dashboard doesn't exist
- `"Permission denied"` → Guest user lacks permissions

## 🔍 Troubleshooting

### Error: "EmbeddedDashboard not found"

**Cause**: Dashboard exists but isn't configured for embedding  
**Solution**: Enable embedding in dashboard settings (see step 2 above)

### Error: "Invalid dashboard ID"

**Cause**: Dashboard ID doesn't exist  
**Solution**: Check dashboard list in Superset and use correct ID

### Error: "Permission denied"

**Cause**: Guest user lacks permissions  
**Solution**: Update guest role permissions in Superset

### Error: "CORS policy"

**Cause**: CORS not configured properly  
**Solution**: Update CORS_OPTIONS in superset_config.py

### Error: "Refused to frame"

**Cause**: CSP headers blocking iframe  
**Solution**: Update TALISMAN_CONFIG frame-ancestors

## 🚀 Production Deployment

### Environment Variables

```env
# Production .env
NEXT_PUBLIC_SUPERSET_URL=https://bi.sdxpartners.com
SUPERSET_ADMIN_TOKEN=your-production-token
VITE_API_BASE_URL=https://portal.sdxpartners.com
```

### Superset Production Config

```python
# Add production domain to CORS and CSP
CORS_OPTIONS = {
    'origins': ['https://portal.sdxpartners.com'],
    # ... other options
}

TALISMAN_CONFIG = {
    "content_security_policy": {
        "frame-ancestors": [
            "'self'",
            "https://portal.sdxpartners.com"
        ]
    }
}
```

## 📊 Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Superset      │
│   (Port 8082)   │    │   (Port 3001)   │    │   (bi.sdx...)   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React App     │───▶│ • Express API   │───▶│ • Admin Token   │
│ • Superset SDK  │    │ • Guest Tokens  │    │ • Guest Tokens  │
│ • Chart Tiles   │◀───│ • CORS Enabled  │◀───│ • Embedded Mode │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✅ Success Checklist

- [ ] Superset `EMBEDDED_SUPERSET` feature enabled
- [ ] CORS configured for portal domains
- [ ] CSP headers allow iframe embedding
- [ ] Dashboard(s) configured for embedding
- [ ] Guest user has proper permissions
- [ ] Backend API responding correctly
- [ ] Frontend SDK loading successfully
- [ ] Guest tokens being generated
- [ ] Charts rendering in portal

## 🎉 Next Steps

Once integration is working:

1. **Add more dashboards** to the portal
2. **Configure chart-level embedding** for individual charts
3. **Implement user authentication** for personalized dashboards
4. **Add dashboard filtering** and interactivity
5. **Set up monitoring** and error tracking

---

**Current Status**: Backend integration complete, awaiting Superset configuration for dashboard embedding.
