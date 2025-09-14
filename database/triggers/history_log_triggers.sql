-- History Log Triggers for HIMS Database
-- These triggers automatically insert records into history_log table
-- when medicine stock operations occur

-- =============================================
-- Trigger 1: Stock In History (Add/Reorder)
-- Fires when new stock is added via medicine_stock_in
-- =============================================
CREATE TRIGGER trg_stock_in_history
ON medicine_stock_in
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        i.medicine_id,
        i.branch_id,
        i.user_id,
        'added', -- matches your CHECK constraint
        i.quantity,
        'New medicine added: ' + m.medicine_name
    FROM inserted i
    JOIN medicines m ON i.medicine_id = m.medicine_id;
END;
GO

-- =============================================
-- Trigger 2: Stock Out History (Dispense)
-- Fires when medicine is dispensed via medicine_stock_out
-- =============================================
CREATE TRIGGER trg_stock_out_history
ON medicine_stock_out
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        i.user_id,
        'dispensed', -- matches your CHECK constraint
        i.quantity_dispensed,
        'dispensed (' + CAST(i.quantity_dispensed AS VARCHAR) + ' units) of ' + m.medicine_name
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;
GO

-- =============================================
-- Trigger 3: Medicine Deleted History (Remove/Expired)
-- Fires when medicine is removed/deleted via medicine_deleted
-- =============================================
CREATE TRIGGER trg_medicine_deleted_history
ON medicine_deleted
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        msi.medicine_id,
        i.branch_id,
        ISNULL(i.deleted_by, 1), -- Use deleted_by if available, otherwise default to user_id 1
        'removed', -- matches your CHECK constraint
        i.quantity,
        'Medicine removed: ' + m.medicine_name + ' (' + CAST(i.quantity AS VARCHAR) + ' units). Reason: ' + ISNULL(i.description, 'No reason provided')
    FROM inserted i
    JOIN medicine_stock_in msi ON i.medicine_stock_in_id = msi.medicine_stock_in_id
    JOIN medicines m ON msi.medicine_id = m.medicine_id;
END;
GO

-- =============================================
-- Optional: Trigger for Restocking (if you want to differentiate)
-- You can modify the stock_in trigger to detect restock vs new add
-- =============================================
/*
-- Alternative version that differentiates between 'added' and 'restocked'
-- Based on whether the medicine already exists in the branch

ALTER TRIGGER trg_stock_in_history
ON medicine_stock_in
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        i.medicine_id,
        i.branch_id,
        i.user_id,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM medicine_stock_in msi 
                WHERE msi.medicine_id = i.medicine_id 
                AND msi.branch_id = i.branch_id 
                AND msi.medicine_stock_in_id != i.medicine_stock_in_id
            ) 
            THEN 'restocked' 
            ELSE 'added' 
        END,
        i.quantity,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM medicine_stock_in msi 
                WHERE msi.medicine_id = i.medicine_id 
                AND msi.branch_id = i.branch_id 
                AND msi.medicine_stock_in_id != i.medicine_stock_in_id
            )
            THEN 'Medicine restocked: ' + m.medicine_name + ' (' + CAST(i.quantity AS VARCHAR) + ' units, expires: ' + CONVERT(VARCHAR, i.expiration_date, 101) + ')'
            ELSE 'New medicine added: ' + m.medicine_name + ' (' + CAST(i.quantity AS VARCHAR) + ' units, expires: ' + CONVERT(VARCHAR, i.expiration_date, 101) + ')'
        END
    FROM inserted i
    JOIN medicines m ON i.medicine_id = m.medicine_id;
END;
*/