-- =============================================
-- HIMS History Log Database Triggers Setup
-- Execute this script in your MSSQL database
-- =============================================

-- First, let's check if triggers already exist and drop them if needed
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_in_history')
    DROP TRIGGER trg_stock_in_history;

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_out_history')
    DROP TRIGGER trg_stock_out_history;

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_medicine_deleted_history')
    DROP TRIGGER trg_medicine_deleted_history;

GO

-- =============================================
-- Trigger 1: Stock In History (Add/Reorder)
-- =============================================
CREATE TRIGGER trg_stock_in_history
ON medicine_stock_in
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert history record for each new stock in entry
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        i.medicine_id,
        i.branch_id,
        i.user_id,
        'added', -- Using 'added' for all stock in operations
        i.quantity,
        'New medicine added: ' + m.medicine_name
    FROM inserted i
    JOIN medicines m ON i.medicine_id = m.medicine_id;
END;

GO

-- =============================================
-- Trigger 2: Stock Out History (Dispense)
-- =============================================
CREATE TRIGGER trg_stock_out_history
ON medicine_stock_out
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert history record for each dispensing operation
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        i.user_id,
        'dispensed',
        i.quantity_dispensed,
        'dispensed (' + CAST(i.quantity_dispensed AS VARCHAR) + ' units) of ' + m.medicine_name
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;

GO

-- =============================================
-- Trigger 3: Medicine Deleted History (Remove)
-- =============================================
CREATE TRIGGER trg_medicine_deleted_history
ON medicine_deleted
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert history record for each medicine removal
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        ISNULL(i.deleted_by, 1), -- Use deleted_by if available, otherwise default to user 1
        'removed',
        i.quantity,
        'Medicine removed: ' + m.medicine_name + ' (' + CAST(i.quantity AS VARCHAR) + ' units). Reason: ' + ISNULL(i.description, 'No reason provided')
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;

GO

-- =============================================
-- Verify triggers were created successfully
-- =============================================
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate
FROM sys.triggers t
WHERE t.name IN ('trg_stock_in_history', 'trg_stock_out_history', 'trg_medicine_deleted_history')
ORDER BY t.name;

-- =============================================
-- Test the triggers (Optional - uncomment to test)
-- =============================================
/*
-- Test data - uncomment and modify as needed
PRINT 'Testing triggers with sample data...';

-- Note: Replace with actual IDs from your database
DECLARE @test_medicine_id INT = 1;
DECLARE @test_branch_id INT = 1;
DECLARE @test_user_id INT = 1;

-- Test stock in trigger
INSERT INTO medicine_stock_in (medicine_id, branch_id, quantity, date_received, expiration_date, user_id)
VALUES (@test_medicine_id, @test_branch_id, 100, GETDATE(), DATEADD(YEAR, 2, GETDATE()), @test_user_id);

-- Check if history was created
SELECT TOP 1 * FROM history_log ORDER BY created_at DESC;

PRINT 'Trigger testing completed. Check history_log table for results.';
*/