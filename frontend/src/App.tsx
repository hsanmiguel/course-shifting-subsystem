import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import StudentDashboard from "@/pages/student/Dashboard";
import Applications from "@/pages/student/Applications";
import CourseEquivalencies from "@/pages/student/CourseEquivalencies";
import ApplicationForm from "@/pages/student/ApplicationForm";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<StudentDashboard />} path="/student/dashboard" />
      <Route element={<Applications />} path="/student/applications" />
      <Route element={<CourseEquivalencies />} path="/student/course-equivalencies" />
      <Route element={<ApplicationForm />} path="/student/application-form" />
    </Routes>
  );
}

export default App;
