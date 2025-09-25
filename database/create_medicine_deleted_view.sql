-- Compatibility view to alias medicine_deleted to medicine_archived
-- Run this on your MSSQL server connected to the HIMS database if you cannot immediately update all code paths.
-- It creates a view named medicine_deleted that selects the same columns from medicine_archived.
-- Note: Adjust column list if your medicine_archived schema differs.

IF OBJECT_ID('dbo.medicine_deleted', 'V') IS NOT NULL
    DROP VIEW dbo.medicine_deleted;
GO

CREATE VIEW dbo.medicine_deleted
AS
SELECT
    medicine_archived_id as medicine_deleted_id,
    medicine_stock_in_id,
    quantity,
    description,
    archived_at as deleted_at,
    branch_id
FROM dbo.medicine_archived;
GO

DROP VIEW dbo.medicine_deleted;
GO