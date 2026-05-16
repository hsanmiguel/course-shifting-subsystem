# Frontend-Backend Connection: Quick Start

## ✅ What's Been Done

### API Infrastructure
- ✅ Created API client (`src/services/api-client.ts`) with all backend endpoints
- ✅ Created React hooks for data fetching (`src/hooks/`)
- ✅ Updated Dashboard component to use real API
- ✅ Updated ApplicationForm component to use real API
- ✅ Environment configuration (.env files)
- ✅ Error handling and loading states
- ✅ Auth token management in localStorage

### Components Updated
- ✅ `src/pages/student/Dashboard.tsx` - Uses API for applications list
- ✅ `src/pages/student/ApplicationForm.tsx` - Submits to backend

### Services Created
- ✅ `src/services/api-client.ts` - HTTP client wrapper
- ✅ `src/services/auth.ts` - Auth service template with React hooks
- ✅ `src/hooks/useApplications.ts` - Fetch applications list with stats
- ✅ `src/hooks/useApplication.ts` - Fetch single application

## 🚀 Get Started (5 minutes)

### 1. Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3000
```

### 2. Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. View the Application
Open `http://localhost:5173` in your browser

## 🔐 Authentication (Required to Test)

**Current State**: API calls will fail without proper authentication

**You need to implement:**
1. Login/signup pages
2. Auth endpoints in backend (if not already implemented)
3. Store JWT token in `localStorage.authToken`
4. Store student ID in `localStorage.studentId`

**Quick Test (for development):**
Add to browser console:
```javascript
localStorage.setItem('authToken', 'test-token');
localStorage.setItem('studentId', '202300695');
location.reload();
```

## 📡 API Endpoints Connected

| Method | Endpoint | Frontend Location |
|--------|----------|-------------------|
| POST | `/api/css/apply` | ApplicationForm.tsx |
| GET | `/api/css/applications` | Dashboard.tsx (useApplications hook) |
| GET | `/api/css/applications/:id` | useApplication hook |
| GET | `/api/css/applications/:id/equivalency` | Dashboard.tsx, EquivalencyTable component |
| GET | `/api/css/audit-logs` | Available via apiClient |
| POST | `/api/css/eligibility-check` | Available via apiClient |
| POST | `/api/css/applications/:id/review` | Available via apiClient |

## 🛠️ Troubleshooting

### CORS Errors
- Backend has CORS enabled in `app.ts`
- Check `VITE_API_BASE_URL` matches backend port

### 401 Unauthorized
- No authentication token provided
- Implement auth (see Authentication section above)
- Temporarily set token in localStorage for testing

### Network Errors
- Backend not running on expected port
- Check backend is actually running
- Verify port number in `.env.local`

## 📁 Key Files

```
frontend/
├── .env.local                           # API configuration
├── src/
│   ├── services/
│   │   ├── api-client.ts               # API wrapper
│   │   └── auth.ts                     # Auth template
│   ├── hooks/
│   │   ├── useApplications.ts          # Fetch list
│   │   ├── useApplication.ts           # Fetch single
│   │   └── index.ts
│   └── pages/student/
│       ├── Dashboard.tsx               # Updated ✅
│       └── ApplicationForm.tsx          # Updated ✅
└── README.md
```

## 🔄 Data Flow

```
User fills form → ApplicationForm.tsx 
  ↓
handleSubmit() calls apiClient.submitApplication()
  ↓
POST /api/css/apply with auth token
  ↓
Backend validates & stores
  ↓
Response → Success notification
  ↓
refetch() updates Dashboard
```

## ✨ Next Steps

1. **Implement Authentication**
   - Create login/signup pages
   - Set up auth endpoints
   - Test with real tokens

2. **Add Error Boundaries**
   - Wrap routes in error boundaries
   - Better error handling

3. **Implement Loading States**
   - Already partially done
   - Expand skeleton screens

4. **Add Refresh Functionality**
   - Implement token refresh
   - Auto-logout on expiry

5. **Add Validation**
   - Client-side validation
   - Better error messages

## 📚 Files to Reference

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed integration guide
- [src/services/api-client.ts](./frontend/src/services/api-client.ts) - API client source
- [src/services/auth.ts](./frontend/src/services/auth.ts) - Auth service template

## 🎯 Testing Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Auth token set in localStorage
- [ ] Student ID set in localStorage
- [ ] Dashboard loads without errors
- [ ] Can see applications list
- [ ] Can submit new application
- [ ] Application appears in list after submission

---

**Status**: Frontend and backend are connected and ready for authentication implementation!
