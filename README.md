# University Enrollment System - Frontend

A modern Next.js frontend application for a university enrollment system that connects to a Laravel API backend.

## Features

### Authentication
- User login and registration
- Role-based access control (Admin/Student)
- JWT token-based authentication
- Automatic token management and refresh

### Admin Features
- Create, read, update, and delete courses
- Manage course schedules and details
- **NEW: Comprehensive enrollment management dashboard**
- **NEW: Approve or reject student enrollments**
- **NEW: Filter enrollments by status (All, Pending, Approved, Rejected)**
- **NEW: View detailed enrollment information with student and course details**
- Clean, professional interface with role-based navigation

### Student Features
- Browse available courses
- Enroll in courses (maximum 3 courses)
- **NEW: View enrollment status page**
- **NEW: Track enrollment requests (pending, approved, rejected)**
- **NEW: View enrollment summary and course details**
- Responsive course catalog

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **State Management**: React Context API

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn** package manager
3. **Laravel API Backend** running on `http://localhost:8000`

## Laravel API Setup

This frontend connects to a Laravel API with the following endpoints:

```
POST /api/register - User registration
POST /api/login - User authentication
GET /api/courses - List all courses
POST /api/courses - Create course (Admin only)
PUT /api/courses/{id} - Update course (Admin only)
DELETE /api/courses/{id} - Delete course (Admin only)
GET /api/enrollments - List all enrollments (Admin only)
POST /api/enroll - Student enrollment
POST /api/enroll/{id}/approve - Approve enrollment (Admin only)
POST /api/enroll/{id}/reject - Reject enrollment (Admin only)
```

### Demo API Data

The system expects these demo accounts to be seeded in the Laravel backend:

- **Admin**: admin@example.com / password
- **Student**: student@example.com / password

## Installation

1. **Clone or extract the project**:
   ```bash
   cd university-enrollment-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your API base URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Main dashboard page
│   ├── enrollments/       # Admin enrollment management page
│   ├── my-enrollments/    # Student enrollment status page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── demo/             # Demo page for UI showcase
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home page with redirects
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   │   ├── Button.tsx   # Button component
│   │   ├── Input.tsx    # Input component
│   │   └── Badge.tsx    # Badge component
│   └── Layout.tsx       # Main layout with navigation
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
└── lib/                # Utility functions and API
    ├── api.ts          # API service layer
    └── utils.ts        # Utility functions
```

## API Integration

The application uses a centralized API service layer (`src/lib/api.ts`) that:

- Configures Axios with base URL and headers
- Automatically adds JWT tokens to requests
- Handles token expiration and redirects
- Provides typed interfaces for all API responses
- Organizes endpoints by feature (auth, courses, enrollments)

## Authentication Flow

1. User logs in with email/password
2. API returns JWT token and user data
3. Token is stored in localStorage
4. Token is automatically added to all API requests
5. On token expiration, user is redirected to login

## Role-Based Access

- **Students**: Can view courses and enroll (max 3 courses)
- **Admins**: Can manage courses and approve/reject enrollments

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Laravel API base URL | `http://localhost:8000/api` |

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## API Error Handling

The application handles common API errors:

- **401 Unauthorized**: Redirects to login page
- **403 Forbidden**: Shows access denied message
- **422 Validation**: Displays field-specific errors
- **500 Server Error**: Shows generic error message

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

# web_frontend
