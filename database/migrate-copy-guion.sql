-- Migration: Add copy and guion fields to contenidos_calendarizados
-- Run this script once against your database

ALTER TABLE contenidos_calendarizados
  ADD COLUMN IF NOT EXISTS copy TEXT,
  ADD COLUMN IF NOT EXISTS copy_v2 TEXT,
  ADD COLUMN IF NOT EXISTS guion TEXT,
  ADD COLUMN IF NOT EXISTS guion_v2 TEXT;
