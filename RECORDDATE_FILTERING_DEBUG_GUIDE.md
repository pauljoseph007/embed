# 🔍 RECORDDATE Filtering Debug Guide

## Issue Analysis

The global date filtering system appears to work (no console errors, UI responds correctly) but the actual filtering is NOT working - charts refresh but show the same unfiltered data instead of filtered results based on the RECORDDATE column.

## Root Cause Investigation

### 1. **Enhanced URL Parameter Generation**

The system now applies **5 different filtering methods** for maximum Superset compatibility:

```typescript
// Method 1: extra_filters with TEMPORAL_RANGE
extra_filters=[{"col":"RECORDDATE","op":"TEMPORAL_RANGE","val":"2024-01-01 : 2024-01-15"}]

// Method 2: form_data.adhoc_filters
form_data={"adhoc_filters":[{"clause":"WHERE","subject":"RECORDDATE","operator":"TEMPORAL_RANGE","comparator":"2024-01-01 : 2024-01-15","expressionType":"SIMPLE"}]}

// Method 3: native_filters for dashboard-level filtering
native_filters={"RECORDDATE_FILTER":{"id":"RECORDDATE_FILTER","targets":[{"column":{"name":"RECORDDATE"}}],"filterType":"filter_time_range","value":"2024-01-01 : 2024-01-15"}}

// Method 4: Standard time range parameters
time_range=2024-01-01 : 2024-01-15
time_range_start=2024-01-01
time_range_end=2024-01-15

// Method 5: Cache busting and standalone mode
force=1737123456789
standalone=1
```

### 2. **Enhanced Chart Component**

- **Force iframe reload** when date range changes
- **Cache busting** with timestamp parameters
- **Enhanced logging** for debugging filter application
- **Standalone mode** enforcement for iframe embedding

## Testing Steps

### Step 1: Use the Debug Tool

1. Navigate to `/debug/date-filter` in your portal
2. Set a global date range (e.g., January 1-15, 2024)
3. Paste your Superset chart URL in the test field
4. Click "Test Full URL in New Tab"
5. Verify if filtering works directly in Superset

### Step 2: Check URL Parameters

The debug tool shows all applied parameters. Look for:
- ✅ `extra_filters` contains RECORDDATE filter
- ✅ `form_data` contains adhoc_filters with RECORDDATE
- ✅ `time_range` parameters are present
- ✅ `standalone=1` is set

### Step 3: Verify Superset Configuration

#### A. Dataset Configuration
1. Go to Superset → Data → Datasets
2. Find your dataset and click "Edit"
3. Verify RECORDDATE column exists and is configured as:
   - **Type**: `DATETIME` or `TIMESTAMP`
   - **Is Filterable**: ✅ Checked
   - **Is Temporal**: ✅ Checked (if available)

#### B. Chart/Dashboard Permissions
1. Ensure your user has permission to:
   - View the chart/dashboard
   - Filter on the RECORDDATE column
   - Execute filtered queries

#### C. Superset Security Settings
Check your Superset configuration for:
```python
# superset_config.py
ENABLE_CORS = True
CORS_OPTIONS = {
    'supports_credentials': True,
    'allow_headers': ['*'],
    'origins': ['http://localhost:8080', 'your-portal-domain.com']
}

# Allow URL parameter filtering
FEATURE_FLAGS = {
    "ENABLE_TEMPLATE_PROCESSING": True,
    "DASHBOARD_NATIVE_FILTERS": True,
    "DASHBOARD_CROSS_FILTERS": True
}
```

## Common Issues & Solutions

### Issue 1: RECORDDATE Column Not Found
**Symptoms**: Filters applied but no data change
**Solution**: 
- Verify column name is exactly "RECORDDATE" (case-sensitive)
- Check if column exists in the underlying dataset
- Ensure column is properly mapped in Superset

### Issue 2: Wrong Data Type
**Symptoms**: Filter parameters ignored
**Solution**:
- Ensure RECORDDATE is configured as datetime/timestamp type
- Check the actual data format in your database
- Verify date format compatibility (YYYY-MM-DD)

### Issue 3: CORS/Security Blocking
**Symptoms**: Charts load but filters don't apply
**Solution**:
- Check browser console for CORS errors
- Verify Superset CORS configuration
- Ensure portal domain is whitelisted

### Issue 4: Cache Issues
**Symptoms**: Old data shown despite filters
**Solution**:
- The system now adds cache-busting parameters automatically
- Clear browser cache and Superset cache
- Check if Superset caching is interfering

### Issue 5: URL Parameter Format
**Symptoms**: Parameters present but not recognized
**Solution**:
- Use the debug tool to test individual filter methods
- Try different parameter combinations
- Check Superset logs for parameter parsing errors

## Verification Checklist

- [ ] RECORDDATE column exists in dataset
- [ ] Column is configured as datetime/timestamp
- [ ] Column is marked as "Filterable"
- [ ] User has filtering permissions
- [ ] CORS is properly configured
- [ ] URL parameters are correctly formatted
- [ ] Cache busting is working
- [ ] Standalone mode is enabled
- [ ] Browser console shows no errors
- [ ] Superset logs show no filtering errors

## Expected Behavior After Fix

1. **Visual Confirmation**: Charts should show visibly different data when date range changes
2. **URL Parameters**: All 5 filtering methods should be present in generated URLs
3. **Console Logging**: Enhanced logs should show filter application details
4. **Real-time Updates**: Charts should refresh automatically when global date range changes
5. **Cache Busting**: Each filter change should generate unique URLs to bypass cache

## Next Steps

If filtering still doesn't work after following this guide:

1. **Test Direct Superset Filtering**: 
   - Open your chart directly in Superset
   - Add a manual date filter on RECORDDATE
   - Verify it works before testing portal integration

2. **Check Superset Version Compatibility**:
   - Different Superset versions use different URL parameter formats
   - Consult Superset documentation for your specific version

3. **Database-Level Verification**:
   - Run direct SQL queries to verify RECORDDATE data exists
   - Check if date ranges contain actual data

4. **Contact Superset Administrator**:
   - Verify server-side configuration
   - Check Superset logs for filtering errors
   - Ensure proper permissions are configured

The enhanced implementation should now provide comprehensive RECORDDATE filtering with multiple fallback methods and detailed debugging information.
