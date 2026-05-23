# Database Seeding Utility

Standalone Node.js utility to populate the PostgreSQL database with realistic test data

## Technology Stack
- pg - PostgreSQL client
- @faker-js/faker for dummy data generation
- Database hosted on Railway

## Setup
```
npm install  
node seed.js
```

Features

- Generates 2,000 realistic user records using @faker-js/faker 
- Batch processing (1,000 records per batch) for performance 
- SSL configuration for cloud PostgreSQL instances (Railway) 

## Database Schema

Creates the users table with:

    id (SERIAL PRIMARY KEY)
    name (TEXT NOT NULL)
    email (TEXT UNIQUE NOT NULL)
    age (INT NOT NULL)
    is_active (BOOLEAN DEFAULT true)
    created_at (TIMESTAMP DEFAULT NOW())

- Includes a composite index on (age, id) for efficient cursor-based pagination schema.