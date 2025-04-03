-- Add reset token fields to users table
ALTER TABLE users
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires DATETIME NULL;
