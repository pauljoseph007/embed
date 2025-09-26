# 📊 Superset Chart Building Guide for SDX Partners Intelligence Portal

## 🎯 **Overview**

This comprehensive guide explains how to build Superset charts that are fully compatible with the SDX Partners Intelligence Portal's sheet-specific filtering system. Follow these guidelines to ensure your charts work seamlessly with the portal's RECORDDATE filtering.

---

## 🔧 **Technical Architecture**

### **Sheet-Specific Filtering System**
The portal now uses **sheet-specific filtering** instead of global filtering:
- Each dashboard sheet has its own independent date filter
- Filters applied on Sheet 1 only affect charts on Sheet 1
- Filters applied on Sheet 2 only affect charts on Sheet 2
- No cross-contamination between sheets

### **RECORDDATE Column Requirements**
All charts must include a `RECORDDATE` column for filtering compatibility:
- **Column Name**: Must be exactly `RECORDDATE` (case-sensitive)
- **Data Type**: DATE or DATETIME
- **Format**: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
- **Purpose**: Universal time filter column across all datasets

---

## 📋 **Step-by-Step Chart Building Process**

### **Step 1: Dataset Preparation**
1. **Ensure RECORDDATE Column Exists**
   ```sql
   -- Example: Add RECORDDATE column if missing
   ALTER TABLE your_table ADD COLUMN RECORDDATE DATE;
   
   -- Example: Populate RECORDDATE from existing date column
   UPDATE your_table SET RECORDDATE = DATE(your_existing_date_column);
   ```

2. **Verify Data Quality**
   ```sql
   -- Check for NULL values
   SELECT COUNT(*) as null_count FROM your_table WHERE RECORDDATE IS NULL;
   
   -- Check date range
   SELECT MIN(RECORDDATE) as earliest, MAX(RECORDDATE) as latest FROM your_table;
   
   -- Check data distribution
   SELECT RECORDDATE, COUNT(*) FROM your_table GROUP BY RECORDDATE ORDER BY RECORDDATE DESC LIMIT 10;
   ```

### **Step 2: Superset Dataset Configuration**
1. **Create/Edit Dataset in Superset**
   - Go to Data → Datasets
   - Create new dataset or edit existing one
   - Ensure `RECORDDATE` column is visible and properly typed

2. **Column Configuration**
   - **Column Name**: `RECORDDATE`
   - **Type**: `DATE` or `DATETIME`
   - **Is Temporal**: ✅ Yes
   - **Is Filterable**: ✅ Yes

### **Step 3: Chart Creation**
1. **Add RECORDDATE to Chart**
   - Even if not needed for visualization, add `RECORDDATE` to the chart
   - This enables portal filtering functionality
   - Options for including RECORDDATE:
     - Add to "Filters" section (recommended)
     - Add to "Dimensions" if needed for grouping
     - Add to "Metrics" if doing date-based calculations

2. **Chart Configuration Best Practices**
   ```json
   {
     "adhoc_filters": [
       {
         "clause": "WHERE",
         "subject": "RECORDDATE",
         "operator": "TEMPORAL_RANGE",
         "comparator": "No filter",
         "expressionType": "SIMPLE"
       }
     ]
   }
   ```

### **Step 4: Testing Chart Compatibility**
1. **Test in Superset Standalone**
   - Apply date filters directly in Superset
   - Verify data changes correctly
   - Check for any errors or warnings

2. **Test Portal Integration**
   - Add chart to portal dashboard
   - Apply sheet-specific date filter
   - Verify chart updates correctly
   - Check browser console for errors

---

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: Filter Not Applied**
**Symptoms**: Chart shows all data regardless of date filter
**Solutions**:
1. Verify RECORDDATE column exists and has data
2. Check column name spelling (case-sensitive)
3. Ensure column is marked as temporal in Superset
4. Clear Superset cache: Settings → Cache → Clear All

### **Issue 2: Chart Shows No Data**
**Symptoms**: Chart is empty when filter is applied
**Solutions**:
1. Check if RECORDDATE values fall within filter range
2. Verify date format compatibility
3. Check for timezone issues
4. Review SQL query in Superset SQL Lab

### **Issue 3: Inconsistent Filtering Between Sheets**
**Symptoms**: Same chart behaves differently on different sheets
**Solutions**:
1. Ensure each sheet has independent filtering
2. Check if chart URLs are properly isolated
3. Clear browser cache and localStorage
4. Verify sheet-specific date ranges are set correctly

### **Issue 4: Large Dataset Performance Issues**
**Symptoms**: Charts load slowly or timeout with filters
**Solutions**:
1. Add database indexes on RECORDDATE column
2. Use data partitioning by date
3. Implement query result caching
4. Consider data aggregation for large datasets

---

## 📊 **Chart Type Specific Guidelines**

### **Time Series Charts**
- Always use RECORDDATE as the time dimension
- Set appropriate time granularity (day, week, month)
- Enable time range filtering in chart settings

### **Bar/Column Charts**
- Include RECORDDATE in filters section
- Consider grouping by time periods if relevant
- Use RECORDDATE for trend analysis

### **Table Charts**
- Include RECORDDATE as a visible column
- Enable column sorting on RECORDDATE
- Use RECORDDATE for data freshness indication

### **KPI/Metric Charts**
- Filter underlying data by RECORDDATE
- Show date range in chart title or description
- Use RECORDDATE for period-over-period comparisons

---

## 🔍 **Validation Checklist**

Before adding any chart to the portal, verify:

- [ ] RECORDDATE column exists in dataset
- [ ] RECORDDATE has valid date values (no NULLs)
- [ ] Chart includes RECORDDATE in configuration
- [ ] Chart responds to date filters in Superset
- [ ] Chart URL includes proper parameters
- [ ] Chart loads without errors in portal
- [ ] Sheet-specific filtering works correctly
- [ ] Performance is acceptable with large date ranges

---

## 🚀 **Advanced Configuration**

### **Custom Date Column Mapping**
If your dataset uses a different date column name:
```sql
-- Create a view with RECORDDATE alias
CREATE VIEW your_table_view AS
SELECT *, your_date_column AS RECORDDATE
FROM your_table;
```

### **Multiple Date Columns**
For datasets with multiple date columns:
```sql
-- Use the most relevant date column as RECORDDATE
SELECT *, 
  CASE 
    WHEN transaction_date IS NOT NULL THEN transaction_date
    WHEN created_date IS NOT NULL THEN created_date
    ELSE updated_date
  END AS RECORDDATE
FROM your_table;
```

### **Performance Optimization**
```sql
-- Add index for better filter performance
CREATE INDEX idx_recorddate ON your_table(RECORDDATE);

-- Partition large tables by date
CREATE TABLE your_table_partitioned (
  -- your columns
  RECORDDATE DATE
) PARTITION BY RANGE (RECORDDATE);
```

---

## 📈 **Best Practices Summary**

1. **Always include RECORDDATE** in every chart, even if not visually needed
2. **Test filtering** in both Superset and portal before deployment
3. **Use consistent date formats** across all datasets
4. **Monitor performance** with large date ranges
5. **Document date column mapping** for complex datasets
6. **Implement proper indexing** for better query performance
7. **Use sheet-specific filtering** to avoid cross-contamination
8. **Clear caches** when troubleshooting filter issues

---

## 🎉 **Conclusion**

Following this guide ensures your Superset charts will work seamlessly with the SDX Partners Intelligence Portal's sheet-specific filtering system. The enhanced filtering approach provides multiple fallback strategies for maximum compatibility across different chart types and datasets.

**For additional support**: Check the portal's debug console logs for detailed filtering information and error messages.
