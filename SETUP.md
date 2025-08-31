# Doctor Appointment Management System - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Yarn package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5050
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/doctor_appointment_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Database Host and Port (optional, used in config)
DB_HOST=localhost
DB_PORT=5432
```

## Installation & Setup

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Set up the database:**

   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in your `.env` file
   - Run database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma client:**

   ```bash
   npx prisma generate
   ```

4. **Start the development server:**
   ```bash
   yarn dev
   ```

The server will automatically seed the database with sample data on first run.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register/patient` - Register a new patient
- `POST /api/v1/auth/register/doctor` - Register a new doctor
- `POST /api/v1/auth/login` - Login user

### Users

- `GET /api/v1/doctors` - Get all doctors (with pagination, filtering, search)
- `GET /api/v1/patients` - Get all patients (with pagination, requires auth)
- `GET /api/v1/specializations` - Get all specializations

### Appointments

- `POST /api/v1/appointments` - Create appointment (patients only)
- `GET /api/v1/appointments/patient` - Get patient appointments (patients only)
- `GET /api/v1/appointments/doctor` - Get doctor appointments (doctors only)
- `PATCH /api/v1/appointments/:id` - Update appointment status

## Sample Data

The system comes with pre-seeded data:

### Doctors

- Dr. John Smith (Cardiology)
- Dr. Sarah Johnson (Dermatology)
- Dr. Michael Brown (Neurology)
- Dr. Emily Davis (Pediatrics)
- Dr. Robert Wilson (Orthopedics)

### Patients

- Alice Johnson
- Bob Smith
- Carol Davis
- David Wilson
- Eva Brown

All users have the password: `password123`

## Testing the API

### 1. Register a Patient

```bash
curl -X POST http://localhost:5050/api/v1/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test.patient@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.patient@example.com",
    "password": "password123"
  }'
```

### 3. Get Doctors (Public)

```bash
curl http://localhost:5050/api/v1/doctors
```

### 4. Create Appointment (Requires Auth)

```bash
curl -X POST http://localhost:5050/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "doctorId": "doctor_id_here",
    "date": "2024-01-15T10:00:00Z"
  }'
```

## Features

- ✅ JWT Authentication
- ✅ Role-based access control (Doctor/Patient)
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ Pagination support
- ✅ Error handling
- ✅ CORS enabled
- ✅ Database seeding
- ✅ TypeScript support
- ✅ Prisma ORM with PostgreSQL
