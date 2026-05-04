import { ReactNode } from 'react';
import { SideNav } from '@/components/SideNav';

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  userRole?: 'student' | 'admin';
  userName?: string;
  studentId?: string;
}

export const SidebarLayout = ({
  children,
  title,
  userRole = 'student',
  userName = 'John Doe',
  studentId = 'STU-2021-0001',
}: SidebarLayoutProps) => {
  const handleLogout = () => {
    console.log('Logout');
    // Add logout logic here
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <SideNav
        userRole={userRole}
        userName={userName}
        studentId={studentId}
        onLogout={handleLogout}
      />

      {/* Main Content - Offset for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-8 py-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
              <p className="text-sm text-slate-500 mt-1">Submit and track your course shifting request</p>
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
