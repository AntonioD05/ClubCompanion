# Club Matcher App

A web application that helps students discover and connect with university clubs based on their interests.

## Project Overview

Club Matcher consists of:
- A PostgreSQL database to store user, club, and communication data
- A FastAPI backend that provides RESTful API endpoints
- A Next.js frontend with a responsive user interface

## Setup Instructions

### 1. Database Setup

#### Using Docker (Recommended)
If you have Docker installed, you can quickly set up a PostgreSQL container:

```bash
docker run --name club-matcher-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=clubmatcher -p 5432:5432 -d postgres
```

To initialize the database schema:
```bash
# Connect to the database
docker exec -it club-matcher-db psql -U admin -d clubmatcher

# From another terminal, run the schema file
cat database/combined_schema.sql | docker exec -i club-matcher-db psql -U admin -d clubmatcher
```

#### Without Docker
1. Install PostgreSQL manually 
2. Create a database called `clubmatcher`
3. Run the combined schema file:
```bash
psql -U your_username -d clubmatcher -f database/combined_schema.sql
```

### 2. Backend Setup

1. Make sure you have Python 3.9+ installed

2. Set up a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # For Mac/Linux
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory:
```
DB_NAME=clubmatcher
DB_USER=admin
DB_PASSWORD=admin
DB_HOST=localhost
```

5. Create the uploads directories:
```bash
mkdir -p uploads/student_profile_pictures uploads/club_profile_pictures
```

6. (Optional) Add test data to the database:
```bash
python create_test_data.py
```

7. Run the FastAPI backend:
```bash
uvicorn main:app --reload
```

The API will be available at http://127.0.0.1:8000/

### 3. Frontend Setup

1. Make sure you have Node.js 18+ installed

2. Navigate to the frontend directory:
```bash
cd club-matcher-frontend
```

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000/

## API Proxy Setup

The frontend is configured to proxy API requests to the backend. The Next.js configuration in `next.config.js` includes these rewrites:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
    {
      source: '/uploads/:path*',
      destination: 'http://localhost:8000/uploads/:path*',
    },
  ]
}
```

This means that:
- Frontend requests to `/api/...` are automatically forwarded to the backend at `http://localhost:8000/api/...`
- Frontend requests to `/uploads/...` are forwarded to the backend at `http://localhost:8000/uploads/...`

This configuration allows the frontend to make API calls without CORS issues and access backend-stored files.

## Usage

1. Register as a student or club
2. Log in with your credentials
3. Students can:
   - Browse and search for clubs
   - Filter clubs by interests and member count
   - Save favorite clubs
   - Message clubs
4. Clubs can:
   - Manage their profile
   - Communicate with interested students
   - View member lists

## Development

- Backend API documentation is available at: http://127.0.0.1:8000/docs
- The frontend uses React components with TypeScript
- Database schema is defined in `database/combined_schema.sql`

## Database Schema

We've combined all SQL schema files into a single `database/combined_schema.sql` file for easier setup and maintenance. This file contains all tables, constraints, and indexes required for the application to function properly.

For more details on the database setup, refer to the `database/README.md` file.

## Troubleshooting

- If you encounter database connection issues, check that your PostgreSQL server is running and that the credentials in `.env` are correct.
- For frontend issues, check the browser console for errors.
- Ensure both the backend and frontend are running simultaneously for full functionality.
