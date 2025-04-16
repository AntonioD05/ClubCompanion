# Database Setup for Club Matcher

This directory contains the database configuration and schema for the Club Matcher application.

## Overview

The Club Matcher application uses PostgreSQL as its database. The schema is defined in `combined_schema.sql`, which contains all the tables, constraints, and indexes required for the application to function properly.

## Setting Up the Database

1. Install PostgreSQL if not already installed
2. Create a new database for the application:
   ```sql
   CREATE DATABASE clubmatcher;
   ```
3. Run the schema setup script:
   ```bash
   psql -U your_username -d clubmatcher -f combined_schema.sql
   ```

## Environment Configuration

Create a `.env` file in the project root with the following database connection parameters:

```
DB_NAME=clubmatcher
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
```

## Tables Overview

The database schema includes:

1. **auth_credentials** - Stores user authentication information
2. **students** - Stores student profiles
3. **clubs** - Stores club profiles
4. **club_members** - Tracks club membership
5. **saved_clubs** - Tracks clubs that students have saved
6. **messages** - Stores messages between students and clubs

## Required Directories

The application requires the following directories for file uploads:

```bash
mkdir -p uploads/student_profile_pictures
mkdir -p uploads/club_profile_pictures
```

## Migrations

When making changes to the database schema, update the `combined_schema.sql` file to ensure that it remains the single source of truth for the database structure.

## Troubleshooting

- If you encounter connection issues, verify that PostgreSQL is running and that your `.env` file contains the correct credentials.
- Ensure that the database user has sufficient privileges to create tables and indexes.
- When deploying to production, modify the DB_HOST in the .env file accordingly. 