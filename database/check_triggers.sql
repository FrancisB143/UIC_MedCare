-- Check if history log triggers exist
-- Run this query in your MSSQL database to verify triggers

SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate,
    t.modify_date AS ModifiedDate
FROM sys.triggers t
WHERE t.name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')
ORDER BY t.name;

-- If no results, the triggers haven't been created yet
-- Run the setup_history_triggers.sql file to create them

-- Also check if the tables exist:
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('medicine_stock_in', 'medicine_stock_out', 'medicine_deleted', 'history_log')
ORDER BY TABLE_NAME;