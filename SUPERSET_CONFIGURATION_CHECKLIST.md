# 🔧 Superset Configuration Checklist

## 📊 **Current Integration Status**

### ✅ **Portal Side - COMPLETED**
- ✅ Backend API working (port 3001)
- ✅ Guest token requests working
- ✅ Superset SDK loading (as `supersetEmbeddedSdk`)
- ✅ Iframe fallback implemented
- ✅ Add Dashboard functionality added
- ✅ Add Chart functionality working
- ✅ Debug page available at `/debug`

### ❌ **Superset Side - NEEDS CONFIGURATION**
- ❌ Dashboard embedding not enabled
- ❌ CORS not configured for portal
- ❌ CSP headers blocking iframe embedding
- ❌ Guest token permissions not set

## 🎯 **REQUIRED SUPERSET CHANGES**

### **1. Enable Embedded Superset Feature**

Add to your `superset_config.py`:

```python
# Enable embedded superset
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    "DASHBOARD_NATIVE_FILTERS": True,
    "DASHBOARD_CROSS_FILTERS": True,
    # ... keep your existing feature flags
}
```

### **2. Configure CORS for Portal Access**

```python
# CORS configuration
ENABLE_CORS = True
CORS_OPTIONS = {
    'origins': [
        # Development URLs
        'http://localhost:8080',
        'http://localhost:8081', 
        'http://localhost:8082',
        'http://localhost:8083',
        'http://localhost:8084',
        'http://localhost:8085',
        # Production URL
        'https://portal.sdxpartners.com'
    ],
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'X-CSRFToken'
    ],
    'supports_credentials': True,
    'expose_headers': ['X-CSRFToken']
}
```

### **3. Configure Content Security Policy**

```python
# CSP configuration for iframe embedding
CONTENT_SECURITY_POLICY_WARNING = False
TALISMAN_ENABLED = True
TALISMAN_CONFIG = {
    "content_security_policy": {
        "frame-ancestors": [
            "'self'",
            # Development URLs
            "http://localhost:8080",
            "http://localhost:8081", 
            "http://localhost:8082",
            "http://localhost:8083",
            "http://localhost:8084",
            "http://localhost:8085",
            # Production URL
            "https://portal.sdxpartners.com"
        ],
        "frame-src": [
            "'self'",
            "http://localhost:8082",
            "https://portal.sdxpartners.com"
        ]
    },
    "force_https": False  # Set to True in production
}
```

### **4. Configure Guest Token Settings**

```python
# Guest token configuration
GUEST_TOKEN_JWT_SECRET = 'your-very-secure-secret-key-here-change-this'
GUEST_TOKEN_JWT_ALGO = 'HS256'
GUEST_TOKEN_JWT_EXP_SECONDS = 3600  # 1 hour expiration

# Guest token header name
GUEST_TOKEN_HEADER_NAME = 'X-GuestToken'
```

### **5. Configure Database for Embedding**

For each dashboard you want to embed:

#### **Step 5a: Enable Dashboard Embedding**
1. Open the dashboard in Superset
2. Click **"Edit dashboard"** (pencil icon)
3. Click **"Properties"** or **"Settings"**
4. Go to **"Advanced"** tab
5. Check the **"Embeddable"** checkbox
6. In **"Allowed Domains"** field, add:
   ```
   http://localhost:8082
   https://portal.sdxpartners.com
   ```
7. Click **"Save"**

#### **Step 5b: Get Dashboard UUID**
1. Open the dashboard
2. Look at the URL: `https://bi.sdxpartners.com/superset/dashboard/{UUID}/`
3. Copy the UUID (e.g., `6403f728-f56c-46ae-ae28-dba04b838c57`)
4. Use this UUID in the portal's "Add Dashboard" feature

### **6. Configure Guest User Permissions**

#### **Step 6a: Create/Update Guest Role**
```sql
-- In Superset, go to Settings > List Roles
-- Create or edit the "Gamma" role to ensure it has:

-- Database Access:
-- - can read on [your database]

-- Dashboard Access:
-- - can read on Dashboard
-- - can read on DashboardFilterStateRestApi
-- - can read on Datasource

-- Chart Access:
-- - can read on Chart
-- - can read on ChartRestApi
```

#### **Step 6b: Assign Permissions via UI**
1. Go to **Settings > List Roles**
2. Edit the **"Gamma"** role
3. Ensure these permissions are checked:
   - `can read on Dashboard`
   - `can read on Chart` 
   - `can read on Datasource`
   - `can read on Database`
   - Access to specific databases your dashboards use

### **7. Test Configuration**

#### **Step 7a: Test CORS**
```bash
curl -H "Origin: http://localhost:8082" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://bi.sdxpartners.com/api/v1/security/guest_token/
```

Expected response should include:
```
Access-Control-Allow-Origin: http://localhost:8082
Access-Control-Allow-Methods: POST
```

#### **Step 7b: Test Guest Token Generation**
```bash
curl -X POST https://bi.sdxpartners.com/api/v1/security/guest_token/ \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{
       "user": {
         "username": "guest_user",
         "first_name": "Guest",
         "last_name": "User"
       },
       "resources": [{
         "type": "dashboard",
         "id": "YOUR_DASHBOARD_UUID"
       }],
       "rls": []
     }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-09-10T14:01:49.260Z"
}
```

## 🧪 **Testing After Configuration**

### **1. Portal Debug Page**
Visit: `http://localhost:8082/debug`

Expected results:
- ✅ Backend API: Connected
- ✅ Superset SDK: Available  
- ✅ Guest Token: Success
- ✅ Chart embedding: Working

### **2. Dashboard Addition Test**
1. Go to dashboard builder
2. Click **"Add Dashboard"**
3. Enter a valid dashboard UUID
4. Enter dashboard name and client name
5. Click **"Validate Dashboard"**
6. Should show: "Dashboard Validated Successfully!"
7. Click **"Add Dashboard to Canvas"**
8. Dashboard should render using SDK (not iframe)

### **3. Chart Addition Test**
1. Click **"Add Chart"**
2. Paste a Superset chart iframe code
3. Should parse successfully and show SDK embedding

## 🚨 **Common Issues & Solutions**

### **Issue 1: "EmbeddedDashboard not found"**
**Cause**: Dashboard not configured for embedding  
**Solution**: Follow Step 5a above

### **Issue 2: CORS errors in browser console**
**Cause**: CORS not configured properly  
**Solution**: Follow Step 2 above and restart Superset

### **Issue 3: "Refused to frame" error**
**Cause**: CSP headers blocking iframe  
**Solution**: Follow Step 3 above

### **Issue 4: Guest token "Permission denied"**
**Cause**: Guest user lacks permissions  
**Solution**: Follow Step 6 above

### **Issue 5: Charts show "SDK not available"**
**Cause**: SDK loading but with different name  
**Solution**: Already fixed in portal code

## 📞 **Support & Verification**

### **After Making Changes:**
1. **Restart Superset** completely
2. **Clear browser cache**
3. **Test the debug page**: `http://localhost:8082/debug`
4. **Check browser console** for any remaining errors

### **Verification Commands:**
```bash
# Test backend
curl http://localhost:3001/api/health

# Test Superset connection  
curl http://localhost:3001/api/test-superset-connection

# Test guest token with real dashboard UUID
curl -X POST http://localhost:3001/api/get-guest-token \
  -H "Content-Type: application/json" \
  -d '{"embedId":"YOUR_DASHBOARD_UUID","embedType":"dashboard"}'
```

---

**Estimated Configuration Time**: 45-60 minutes  
**Priority**: High - Required for portal functionality  
**Status**: Portal ready, awaiting Superset configuration
