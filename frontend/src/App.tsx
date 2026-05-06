import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import IndexPage from "@/pages/index";
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/student/Dashboard";
import Applications from "@/pages/student/Applications";
import CourseEquivalencies from "@/pages/student/CourseEquivalencies";
import ApplicationForm from "@/pages/student/ApplicationForm";
import EligibilityChecker from "@/pages/student/EligibilityChecker";
import AdminDashboard from "@/pages/admin/Dashboard";
import AllApplications from "@/pages/admin/AllApplications";
import AuditLogs from "@/pages/admin/AuditLogs";

function getDashboardRoute(role?: string) {
  const userRole = role || localStorage.getItem('userRole') || localStorage.getItem('role') || 'student';
  
  switch (userRole) {
    case 'student':
      return '/student/dashboard';
    case 'adviser':
      return '/adviser/dashboard';
    case 'department_head':
      return '/department/dashboard';
    case 'registrar':
      return '/registrar/dashboard';
    case 'system_admin':
      return '/admin/dashboard';
    default:
      return '/student/dashboard';
  }
}

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  // Check if authToken exists AND all required user data is in localStorage
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('studentId');
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = !!(token && userId && userRole);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<ProtectedRoute element={<Navigate to={getDashboardRoute()} replace />} />} path="/" />
      <Route element={<ProtectedRoute element={<IndexPage />} />} path="/home" />
      <Route element={<ProtectedRoute element={<StudentDashboard />} />} path="/student/dashboard" />
      <Route element={<ProtectedRoute element={<StudentDashboard />} />} path="/student" />
      <Route element={<ProtectedRoute element={<Applications />} />} path="/student/applications" />
      <Route element={<ProtectedRoute element={<EligibilityChecker />} />} path="/student/eligibility-checker" />
      <Route element={<ProtectedRoute element={<CourseEquivalencies />} />} path="/student/course-equivalencies" />
      <Route element={<ProtectedRoute element={<ApplicationForm />} />} path="/student/application-form" />
      <Route element={<ProtectedRoute element={<AdminDashboard />} />} path="/admin/dashboard" />
      <Route element={<ProtectedRoute element={<AllApplications />} />} path="/admin/applications" />
      <Route element={<ProtectedRoute element={<AuditLogs />} />} path="/admin/audit-logs" />
      <Route element={<Navigate to="/login" replace />} path="*" />
    </Routes>
  );
}

export default App;
