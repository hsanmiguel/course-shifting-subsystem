import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import StudentDashboard from "@/pages/student/Dashboard";
import Applications from "@/pages/student/Applications";
import CourseEquivalencies from "@/pages/student/CourseEquivalencies";
import ApplicationForm from "@/pages/student/ApplicationForm";
import AdminDashboard from "@/pages/admin/Dashboard";
import AllApplications from "@/pages/admin/AllApplications";
import AuditLogs from "@/pages/admin/AuditLogs";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<StudentDashboard />} path="/student/dashboard" />
      <Route element={<Applications />} path="/student/applications" />
      <Route element={<CourseEquivalencies />} path="/student/course-equivalencies" />
      <Route element={<ApplicationForm />} path="/student/application-form" />
      <Route element={<AdminDashboard />} path="/admin" />
      <Route element={<AdminDashboard />} path="/admin/dashboard" />
      <Route element={<AllApplications />} path="/admin/applications" />
      <Route element={<AuditLogs />} path="/admin/audit-logs" />
    </Routes>
  );
}

export default App;
