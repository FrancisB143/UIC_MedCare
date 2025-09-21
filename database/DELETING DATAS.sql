-- =============================================
-- Delete all data from history + medicine tables
-- (Correct dependency order for foreign keys)
-- =============================================

-- 0. History log first (depends on medicines, users, branches)
DELETE FROM history_log;

-- 1. Child tables
DELETE FROM medicine_stock_out;
DELETE FROM medicine_deleted;

-- 2. Then stock_in (parent of stock_out/deleted)
DELETE FROM medicine_stock_in;

-- 3. Finally medicines (parent of stock_in)
DELETE FROM medicines;	

PRINT '✅ All data removed from history_log, medicines, medicine_stock_in, medicine_stock_out, and medicine_deleted.';
