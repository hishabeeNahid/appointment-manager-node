# Doctor Appointment Management System (Frontend Task)

## Overview

Build a modern, responsive Doctor Appointment Management System frontend using React/Next.js. This task evaluates your skills in building real-world applications with modern frontend technologies and API integration.

## Tech Stack Requirements

### Core Technologies

- **React** or **Next.js** (Next.js preferred)
- **TypeScript** (optional but highly recommended)
- **Tailwind CSS** for styling
- **Axios** for API communication

### Bonus Technologies

- **Zustand** or **Redux Toolkit (RTK)** for state management
- **React Query (TanStack Query)** for API calls with caching
- **React Hook Form** for form handling
- **Zod** for schema validation

## Authentication & Registration

### Login Page (`/login`)

- Single login form with email, password
- Role Selection: Login as Doctor / Login as Patient
- Form validation and error handling

### Registration Page (`/register`)

- Tabbed interface for Patient/Doctor registration
- Patient: name, email, password, photo_url (optional)
- Doctor: name, email, password, specialization, photo_url (optional)
- Real-time form validation

## Patient Dashboard (`/patient/dashboard`)

### Features

1. **Doctor List** (Paginated & Searchable)

   **Description**: A comprehensive directory of all available doctors with advanced filtering and search capabilities.

   **Functionality**:

   - **Doctor Cards**: Each doctor is displayed in an attractive card format showing their profile photo, name, and medical specialization
   - **Search by Doctor Name**: Real-time search functionality that filters doctors as the user types, making it easy to find specific healthcare providers
   - **Filter by Specialization**: Dropdown filter allowing patients to browse doctors by medical specialty (e.g., Cardiologist, Dentist, Neurologist)
   - **Book Appointment Button**: Direct action button on each doctor card for immediate appointment scheduling
   - **Pagination**: Efficient loading of doctor data with page navigation to handle large numbers of healthcare providers

2. **Book Appointment**

   **Description**: Streamlined appointment booking system with intuitive date selection and confirmation workflow.

   **Functionality**:

   - **Modal Interface**: Clean, focused booking experience that doesn't disrupt the user's browsing flow
   - **Date Picker**: User-friendly calendar interface for selecting preferred appointment dates
   - **Success Feedback**: Clear confirmation messages and next steps after successful booking

3. **My Appointments** (`/patient/appointments`)

   **Description**: Personal appointment management center where patients can view, track, and manage all their scheduled appointments.

   **Functionality**:

   - **Status-Based Filtering**: Organize appointments by current status (Pending, Cancelled, Completed) for easy tracking
   - **Appointment List**: Detailed view of all appointments with doctor information, scheduled dates, and current status
   - **Cancel Functionality**: Ability to cancel pending appointments with confirmation dialogs to prevent accidental cancellations

## Doctor Dashboard (`/doctor/dashboard`)

### Features

1. **Appointment List** (Paginated)

   **Description**: Centralized appointment management interface for healthcare providers to efficiently handle their patient schedule.

   **Functionality**:

   - **Comprehensive View**: Complete list of all appointments with patient details, scheduled times, and current status
   - **Date Filtering**: Filter appointments by specific date
   - **Status Filtering**: Quick filtering by appointment status (Pending, Completed, Cancelled) for better organization
   - **Pagination**: Efficient data loading for practices with high appointment volumes

2. **Appointment Management**

   **Description**: Complete control panel for doctors to update appointment statuses and manage patient interactions.

   **Functionality**:

   - **Mark as Completed**: Update appointment status to realtime reflect to UI .
   - **Mark as Cancelled**: Cancel appointments. realtime reflect to UI
   - **Confirmation Dialogs**: Safety measures to prevent accidental status changes with clear confirmation prompts

## API Documentation

### Base URL

```
https://appointment-manager-node.onrender.com/api/v1
```

### Authentication

```http
POST /auth/login
Body: { email, password, role } // role = DOCTOR | PATIENT

POST /auth/register/patient
Body: { name, email, password, photo_url? }

POST /auth/register/doctor
Body: { name, email, password, specialization, photo_url? }
```

### Specializations

```http
GET /specializations
Response: ["Cardiologist", "Dentist", "Neurologist", ...]
```

### Doctors

```http
GET /doctors?page={page}&limit={limit}&search={name?}&specialization={specialization?}
```

### Appointments create

```http
POST /appointments
Body: { doctorId, date }
```

### Get Patient Appointment

```
GET /appointments/patient?status={status?}&page={page}

```

### Get Doctor appointment

```
GET /appointments/doctor?status={status?}&date={yyyy-mm-dd?}&page={page}
```

### update status

```
PATCH /appointments/update-status
Body: { status, appointment_id } // status = COMPLETE | CANCELLED
```

## UI/UX Requirements

### Design Guidelines

- Modern, clean design with Tailwind CSS
- Mobile-first responsive approach
- Loading states and error handling
- Success/error notifications
- Accessibility compliance

## Bonus Features

### Advanced State Management

- Zustand or RTK Query implementation
- Persistent authentication state
- Optimistic updates

### React Query Integration

- API caching and background refetching
- Cache invalidation strategies

## Deliverables

### Required

1. **Working Application**: Hosted on Vercel/Netlify
2. **GitHub Repository**: Clean commits and organization
3. **README.md**: Setup instructions and documentation

## Evaluation Criteria

### Technical Skills (70%)

- Code quality and organization
- TypeScript usage
- Component reusability
- State management
- API integration

### Bonus Features (20%)

- Advanced state management
- React Query implementation
- Additional features

### Documentation (10%)

- README quality
- Code comments
- Commit messages

## Contact & Support

### Technical Support

- **Email**: hishabee.nahidahmed@gmail.com
- **Slack**: https://nahidahmed.slack.com/archives/C09CF2ABDEK

### API Status

- **Health Check**: https://appointment-manager-node.onrender.com/api/v1/health

### Submission

- **Repository URL**: Submit your GitHub repository link
- **Live Demo**: Submit your deployed application URL
- **Cover Letter**: Brief explanation of your approach

## Useful Resources

### Documentation

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Tools & Libraries

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

### Design Resources

- [Heroicons](https://heroicons.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Tailwind UI](https://tailwindui.com/)

---

**Good luck with your implementation! We're excited to see what you build! ���**
