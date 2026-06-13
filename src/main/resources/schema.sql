-- ============================================
-- Services App - PostgreSQL Schema Script
-- ============================================

-- Create Database (run this separately as superuser)
-- CREATE DATABASE serviceapp;

-- ============================================
-- 1. Category Table
-- ============================================
CREATE TABLE IF NOT EXISTS category (
    id            BIGSERIAL       PRIMARY KEY,
    category_name VARCHAR(255)    NOT NULL
);

-- ============================================
-- 2. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id    BIGSERIAL       PRIMARY KEY,
    name  VARCHAR(255)    NOT NULL,
    email VARCHAR(255)    NOT NULL UNIQUE
);

-- ============================================
-- 3. Services Table
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id          BIGSERIAL       PRIMARY KEY,
    category_id BIGINT          NOT NULL REFERENCES category(id),
    user_id     BIGINT          NOT NULL REFERENCES users(id),
    title       VARCHAR(255)    NOT NULL,
    description TEXT,
    amount      NUMERIC(10, 2)  NOT NULL,
    unit        VARCHAR(100)
);
