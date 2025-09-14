-- =============================================
-- HIMS Trigger Troubleshooting Script
-- Run this to check if triggers exist and test them
-- =============================================

-- Step 1: Check if triggers exist
PRINT '=== CHECKING EXISTING TRIGGERS ===';
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate,
    t.modify_date AS ModifiedDate
FROM sys.triggers t
WHERE t.name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')
ORDER BY t.name;

-- If no triggers found, they need to be created
IF (SELECT COUNT(*) FROM sys.triggers WHERE name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')) = 0
BEGIN
    PRINT 'WARNING: No triggers found! You need to run the setup_history_triggers.sql script first.';
END
ELSE
BEGIN
    PRINT 'Triggers found. Checking trigger definitions...';
END

-- Step 2: Check table structures
PRINT '=== CHECKING TABLE STRUCTURES ===';

-- Check medicine_stock_out table structure
PRINT 'medicine_stock_out table columns:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'medicine_stock_out'
ORDER BY ORDINAL_POSITION;

-- Check history_log table structure
PRINT 'history_log table columns:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'history_log'
ORDER BY ORDINAL_POSITION;

-- Step 3: Check recent dispense operations
PRINT '=== CHECKING RECENT DISPENSE OPERATIONS ===';
SELECT TOP 5
    mso.*,
    m.medicine_name,
    b.branch_name,
    u.name as user_name
FROM medicine_stock_out mso
LEFT JOIN medicine_stock_in msi ON mso.medicine_stock_in_id = msi.medicine_stock_in_id
LEFT JOIN medicines m ON msi.medicine_id = m.medicine_id
LEFT JOIN branches b ON mso.branch_id = b.branch_id
LEFT JOIN users u ON mso.user_id = u.user_id
ORDER BY mso.timestamp_dispensed DESC;

-- Step 4: Check corresponding history_log entries
PRINT '=== CHECKING HISTORY LOG ENTRIES ===';
SELECT TOP 10
    hl.*,
    m.medicine_name,
    b.branch_name,
    u.name as user_name
FROM history_log hl
LEFT JOIN medicines m ON hl.medicine_id = m.medicine_id
LEFT JOIN branches b ON hl.branch_id = b.branch_id
LEFT JOIN users u ON hl.user_id = u.user_id
WHERE hl.activity = 'dispensed'
ORDER BY hl.created_at DESC;

-- Step 5: Manual test of trigger (Optional - uncomment to test)
/*
PRINT '=== TESTING TRIGGER MANUALLY ===';

-- Get a valid medicine_stock_in_id for testing
DECLARE @test_stock_in_id INT;
DECLARE @test_branch_id INT;
DECLARE @test_user_id INT;

SELECT TOP 1 
    @test_stock_in_id = medicine_stock_in_id,
    @test_branch_id = branch_id,
    @test_user_id = user_id
FROM medicine_stock_in
WHERE quantity > 5; -- Ensure there's enough stock

IF @test_stock_in_id IS NOT NULL
BEGIN
    PRINT 'Testing with stock_in_id: ' + CAST(@test_stock_in_id AS VARCHAR);
    
    -- Count history entries before
    DECLARE @history_count_before INT;
    SELECT @history_count_before = COUNT(*) FROM history_log WHERE activity = 'dispensed';
    
    -- Insert test dispense record
    INSERT INTO medicine_stock_out (medicine_stock_in_id, quantity_dispensed, user_id, branch_id, reason)
    VALUES (@test_stock_in_id, 1, @test_user_id, @test_branch_id, 'Trigger test');
    
    -- Count history entries after
    DECLARE @history_count_after INT;
    SELECT @history_count_after = COUNT(*) FROM history_log WHERE activity = 'dispensed';
    
    IF @history_count_after > @history_count_before
    BEGIN
        PRINT 'SUCCESS: Trigger created history entry!';
        SELECT TOP 1 * FROM history_log WHERE activity = 'dispensed' ORDER BY created_at DESC;
    END
    ELSE
    BEGIN
        PRINT 'FAILED: Trigger did not create history entry!';
    END
END
ELSE
BEGIN
    PRINT 'No valid test data found in medicine_stock_in table';
END
*/

-- Step 6: Check for trigger errors
PRINT '=== CHECKING FOR RECENT SQL ERRORS ===';
-- This requires SQL Server error log access - may not work in all environments

PRINT '=== TROUBLESHOOTING COMPLETE ===';
PRINT 'If triggers exist but history entries are not being created:';
PRINT '1. Check if the trigger is disabled';
PRINT '2. Verify foreign key relationships';
PRINT '3. Check for trigger errors in SQL Server logs';
PRINT '4. Ensure the application is connecting to the correct database';