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
    <div className="min-h-screen bg-gray-50 flex">
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
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">Submit and track your program transfer applications</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {children}
          </main>

          {/* Footer */}
          <div className="bg-gray-900 text-gray-400 text-sm py-6">
            <div className="px-8">
              <div className="flex justify-between items-center">
                <span>&copy; 2024 University Course Shifting System. All rights reserved.</span>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
