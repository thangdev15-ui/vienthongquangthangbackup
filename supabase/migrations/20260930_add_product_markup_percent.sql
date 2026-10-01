-- Keeps existing product prices unchanged. NULL means the product uses its legacy stored web price.
ALTER TABLE products ADD COLUMN IF NOT EXISTS markup_percent real;
