-- Add selectedSize and selectedColor columns to Cart table
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_size VARCHAR(50);
ALTER TABLE cart ADD COLUMN IF NOT EXISTS selected_color VARCHAR(50);

-- Update existing cart items with default values
UPDATE cart SET selected_size = 'Free Size' WHERE selected_size IS NULL;
UPDATE cart SET selected_color = 'Default' WHERE selected_color IS NULL;
