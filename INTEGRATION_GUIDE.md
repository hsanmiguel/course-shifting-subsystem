# Frontend-Backend Integration Guide

## Overview
The frontend and backend have been connected with a complete API client setup. The frontend now makes real API calls to the backend instead of using mock data.

## Setup Instructions

### 1. Configure Backend URL
The frontend expects the backend to run on `http://localhost:3000` by default.

**File**: `frontend/.env.local`
```
VITE_API_BASE_URL=http://localhost:3000
VITE_AUTH_TOKEN=
```

For production, update `VITE_API_BASE_URL` to your actual backend URL.

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3000` by default.

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port).

## Key Features Implemented

### API Client (`src/services/api-client.ts`)
- Centralized API communication
- Automatic bearer token injection
- Error handling and JSON parsing
- All backend endpoints wrapped

**Available Methods:**
- `submitApplication()` - POST /api/css/apply
- `listApplications()` - GET /api/css/applications
- `getApplication()` - GET /api/css/applications/:id
- `getEquivalency()` - GET /api/css/applications/:id/equivalency
- `getAuditLogs()` - GET /api/css/applications/:id/audits
- `getAllAuditLogs()` - GET /api/css/audit-logs
- `checkEligibility()` - POST /api/css/eligibility-check
- `reviewApplication()` - POST /api/css/applications/:id/review
- `setAuthToken()` - Store auth token in localStorage
- `getAuthToken()` - Retrieve auth token

### React Hooks (`src/hooks/`)
- `useApplications()` - Fetch user's applications with stats
- `useApplication()` - Fetch single application with equivalencies

### Updated Components
- **Dashboard** (`src/pages/student/Dashboard.tsx`) - Now uses real API data
- **ApplicationForm** (`src/pages/student/ApplicationForm.tsx`) - Submits to real backend

## Authentication Setup (TODO)

You need to implement authentication. The backend requires:
- `Authorization: Bearer <token>` header
- Authentication middleware validates tokens
- Role-based access control (student, adviser, department_head, registrar, system_admin)

### Steps to Implement Auth:
1. Create an authentication service (`src/services/auth.ts`)
2. Implement login/logout logic
3. Store JWT token in `localStorage` (key: `authToken`)
4. Store user ID in `localStorage` (key: `studentId`)
5. Create a login page/modal
6. Protect routes with authentication check

### Example Auth Service Pattern:
```typescript
export const authService = {
  async login(credentials: {email: string; password: string}) {
    // Call backend auth endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    
    // Store token and user info
    apiClient.setAuthToken(data.token);
    localStorage.setItem('studentId', data.userId);
    return data;
  },
  
  logout() {
    apiClient.clearAuthToken();
    localStorage.removeItem('studentId');
  }
};
```

## Error Handling

All API calls include error handling:
- Network errors → Generic message
- API errors → Server error message from response
- Validation errors → Specific field errors from backend

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_AUTH_TOKEN` | Optional default token | (leave empty for now) |

## API Response Format

All endpoints return JSON. Example:
```javascript
// Single object
{
  id: 'CSR-2024-001',
  studentId: 'STU-2021-0001',
  status: 'under_review',
  ...
}

// List response
{
  data: [
    {...},
    {...}
  ]
}
```

## Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled (already configured in `backend/src/app.ts`)
- Check that `VITE_API_BASE_URL` matches backend URL

### 401 Unauthorized Errors
- Token may be missing or invalid
- Implement proper authentication (see Authentication Setup section)

### Network Errors
- Verify backend is running
- Check correct port in `VITE_API_BASE_URL`

## Next Steps

1. **Implement Authentication**: Create login/signup pages
2. **Add Error Boundaries**: Wrap components in error boundaries
3. **Add Loading States**: Already started, expand as needed
4. **Implement Refresh Logic**: Add ability to refresh data
5. **Add Validation**: Client-side validation before API calls
6. **Implement Real Auth**: Connect to your authentication backend

## File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── api-client.ts          # API communication
│   ├── hooks/
│   │   ├── useApplications.ts      # Fetch applications list
│   │   ├── useApplication.ts       # Fetch single application
│   │   └── index.ts
│   ├── pages/
│   │   └── student/
│   │       ├── Dashboard.tsx       # Updated with API
│   │       └── ApplicationForm.tsx # Updated with API
│   └── ...
├── .env.example
└── .env.local                      # (gitignored)
```

## Testing the Integration

1. Start both servers
2. Navigate to Dashboard
3. You should see loading state briefly
4. If student is logged in, applications will display
5. Create new application → submits to backend
6. Applications list updates after successful submission

---

**Status**: Frontend and backend are now connected. Authentication layer needs to be implemented for full functionality.
