# Backend Setup

This application uses a minimal Node.js backend with PostgreSQL for database connectivity.

## Prerequisites

1. **PostgreSQL** with **PostGIS** extension installed and running
2. **Node.js** and **npm**

### Installing PostgreSQL (if not installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use: `winget install PostgreSQL.PostgreSQL`
- During installation, remember the password you set for the `postgres` user

**macOS:**
- `brew install postgresql@15 postgis`
- `brew services start postgresql@15`

**Linux (Ubuntu/Debian):**
- `sudo apt-get install postgresql postgresql-contrib postgis`

## Database Setup

**Important:** `colegios_db` is a PostgreSQL database that will be created within your PostgreSQL server instance, not a folder in your project directory. PostgreSQL databases are stored in the PostgreSQL data directory (typically managed automatically by the PostgreSQL server). You don't need to create any folders - just run the SQL commands below to create the database.

1. Connect to your PostgreSQL server (using `psql`, pgAdmin, or another PostgreSQL client) and create the database with PostGIS:
```sql
CREATE DATABASE colegios_db;
\c colegios_db
CREATE EXTENSION postgis;
```

2. **Check your database setup** (recommended first step):
   ```bash
   node check-database.js
   ```
   This script will verify:
   - Database connection
   - PostGIS extension

## Environment Configuration

**IMPORTANT:** Create a `.env` file in the project root with your database credentials:

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```
   (On Linux/Mac: `cp .env.example .env`)

2. Edit `.env` and update these values:
   ```env
   # Database Configuration - UPDATE THESE!
   DB_USER=postgres                    # Your PostgreSQL username
   DB_HOST=localhost                    # Usually localhost
   DB_NAME=colegios_db                  # Your database name
   DB_PASSWORD=your_actual_password     # ⚠️ CHANGE THIS to your PostgreSQL password
   DB_PORT=5432                         # Default PostgreSQL port

   # API Configuration
   REACT_APP_API_URL=http://localhost:3001
   PORT=3001
   ```

3. **Make sure PostgreSQL is running:**
   - Windows: Check Services (services.msc) for "postgresql" service
   - Or try: `psql -U postgres` in command prompt

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run server
```

Or run both frontend and backend together:
```bash
npm install -g concurrently
npm run dev
```

## Troubleshooting

### Error: "Database connection error" or "Authentication failed"

- Verify PostgreSQL is running (check Services on Windows)
- Check your `.env` file has correct credentials
- Test connection: `psql -U postgres -d colegios_db`

### Error: "Cannot connect to backend server"

- Make sure the backend server is running: `npm run server`
- Check that port 3001 is not blocked by firewall
- Verify `REACT_APP_API_URL` in `.env` matches the server port
