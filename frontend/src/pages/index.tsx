import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/layouts/default";
import { Card } from "@heroui/react";
import { Spinner } from "@heroui/react";

export default function IndexPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole') || localStorage.getItem('role') || 'student';
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-screen">
          <Spinner />
        </section>
      </DefaultLayout>
    );
  }

  const getDashboardRoute = () => {
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
  };

  const getDashboardLabel = () => {
    switch (userRole) {
      case 'student':
        return 'Student Dashboard';
      case 'adviser':
        return 'Adviser Dashboard';
      case 'department_head':
        return 'Department Head Dashboard';
      case 'registrar':
        return 'Registrar Dashboard';
      case 'system_admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-screen">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  IAE System
                </h1>
                <p className="text-sm text-slate-600">
                  Course Shifting Subsystem
                </p>
              </div>

              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  Welcome back! Access your dashboard to manage applications and track your course shifts.
                </p>
              </div>

              <button
                onClick={() => navigate(getDashboardRoute())}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Go to {getDashboardLabel()}
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition"
              >
                Logout
              </button>
            </div>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
