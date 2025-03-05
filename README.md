# Club Matcher App - README

## 1. Run the PostgreSQL Database

### Using Docker (Recommended)
If you have Docker installed, you can quickly set up a PostgreSQL container:
```bash
docker run --name club-matcher-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=clubmatcher -p 5432:5432 -d postgres
```
To enter the database:
```bash
docker exec -it club-matcher-db psql -U admin -d clubmatcher
```
Run the schema file:
```bash
psql -U admin -d clubmatcher -f schema.sql
```

### Without Docker
Install PostgreSQL manually and run:
```bash
psql -U your_username -d clubmatcher -f schema.sql
```
Create a `.env` file in the root directory using `.env.example` as a template:

## 2. Set Up and Run the FastAPI Backend

### Install Dependencies
Make sure you have Python installed, then set up a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  (For Mac/Linux)
```

Install all required packages from requirements.txt:
```bash
pip install -r requirements.txt
```

### Environment Setup
Create a `.env` file in the root directory using `.env.example` as a template. This file should contain your database configuration.

### Run FastAPI
```bash
uvicorn main:app --reload
```
The API will be available at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## 3. Set Up and Run the Next.js Frontend

### Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npx create-next-app@latest club-matcher-frontend
cd club-matcher-frontend
npm install
```
Copy `pages/index.js` into the frontend project.

### Run Next.js
```bash
npm run dev
```
The frontend will be available at [http://localhost:3000/](http://localhost:3000/).
