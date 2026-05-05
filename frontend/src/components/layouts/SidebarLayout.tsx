import { ReactNode } from 'react';
import { SideNav } from '@/components/SideNav';
import { authService } from '@/services/auth';

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  userRole?: 'student' | 'admin';
  userName?: string;
  studentId?: string;
}

export const SidebarLayout = ({
  children,
  title,
  subtitle = 'Submit and track your course shifting request',
  userRole = 'student',
  userName,
  studentId,
}: SidebarLayoutProps) => {
  const currentUser = authService.getCurrentUser();
  const displayName = userName || currentUser?.name || 'Student';
  const displayStudentId = studentId || currentUser?.id || '';

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <SideNav
        userRole={userRole}
        userName={displayName}
        studentId={displayStudentId}
        onLogout={handleLogout}
      />

      {/* Main Content - Offset for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-8 py-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {children}
          </main>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white text-slate-500 text-sm py-5">
            <div className="px-8">
              <div className="flex justify-between items-center">
                <span>&copy; 2024 University Course Shifting System</span>
                <div className="flex gap-6 text-sm">
                  <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
