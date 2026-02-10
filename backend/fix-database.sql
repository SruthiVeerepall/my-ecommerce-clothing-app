-- ====================================================
-- FIX FOR IMAGE UPLOAD ERROR (500 Internal Server Error)
-- ====================================================
-- This script updates the database to support image uploads
-- 
-- HOW TO RUN:
-- 1. Open MySQL Workbench
-- 2. Connect to your database (localhost, user: root, password: Sruthi@1234)
-- 3. Copy and paste this entire script into the query editor
-- 4. Click the Execute button (lightning bolt icon)
-- 5. Restart your Spring Boot backend
-- ====================================================

USE ecommerce_db;

-- Drop existing constraint if any
ALTER TABLE product MODIFY COLUMN image_url LONGTEXT NULL;

-- Update the column to support large base64 images
ALTER TABLE product MODIFY COLUMN image_url LONGTEXT NOT NULL;

-- Verify the change worked
DESCRIBE product;

-- You should see image_url with type "mediumtext"
SELECT '[SUCCESS] Database updated! Now restart your Spring Boot backend.' AS status;
