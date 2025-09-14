-- =============================================
-- Update Dispense Trigger for Fixed Description Format
-- This script updates only the stock out history trigger
-- =============================================

-- Drop existing trigger
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_stock_out_history')
    DROP TRIGGER trg_stock_out_history;

GO

-- Create updated trigger with fixed description format
CREATE TRIGGER trg_stock_out_history
ON medicine_stock_out
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Insert history record with fixed description format
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

-- Verify the trigger was created
SELECT 
    t.name AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.is_disabled AS IsDisabled,
    t.create_date AS CreatedDate
FROM sys.triggers t
WHERE t.name = 'trg_stock_out_history';

PRINT 'Dispense trigger updated successfully!';
PRINT 'New description format: "dispensed (X units) of Medicine Name"';