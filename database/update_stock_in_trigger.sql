-- =============================================
-- Update Stock In Trigger for Simplified Description
-- This script updates only the stock in history trigger
-- =============================================

-- Drop existing trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_in_history')
    DROP TRIGGER trg_stock_in_history;

GO

-- Create updated trigger with simplified description format
CREATE TRIGGER trg_stock_in_history
ON medicine_stock_in
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert history record with simplified description format
    INSERT INTO history_log (medicine_id, branch_id, user_id, activity, quantity, description)
    SELECT 
        i.medicine_id,
        i.branch_id,
        i.user_id,
        'added',
        i.quantity,
        'New medicine added: ' + m.medicine_name
    FROM inserted i
    JOIN medicines m ON i.medicine_id = m.medicine_id;
END;

GO

-- Verify the trigger was created
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate
FROM sys.triggers t
WHERE t.name = 'trg_stock_in_history';

PRINT 'Stock in trigger updated successfully!';
PRINT 'New description format: "New medicine added: Medicine Name"';