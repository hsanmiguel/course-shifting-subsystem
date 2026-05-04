import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

interface SideNavProps {
  userRole?: 'student' | 'admin';
  userName?: string;
  studentId?: string;
  onLogout?: () => void;
}

// Icons


const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ApplicationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FormIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EquivalenciesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const SideNav = ({
  userRole = 'student',
  userName = 'Student User',
  studentId = 'STU-2021-0001',
  onLogout = () => console.log('Logout'),
}: SideNavProps) => {
  // Keep sidebar open for students (static), allow toggle for admin
  const isStudent = userRole === 'student';
  const [isOpen, setIsOpen] = useState(!isStudent);

  const studentNavItems = [
    {
      label: 'Dashboard',
      href: '/student/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'My Applications',
      href: '/student/applications',
      icon: <ApplicationIcon />,
    },
    {
      label: 'Application Form',
      href: '/student/application-form',
      icon: <FormIcon />,
    },
    {
      label: 'Course Equivalencies',
      href: '/student/course-equivalencies',
      icon: <EquivalenciesIcon />,
    },
  ];

  const adminNavItems = [
    {

    },
    {
      label: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: <DashboardIcon />,
    },
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Menu Button - Hidden for students (static sidebar) */}
      {!isStudent && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-slate-900 text-white rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay for mobile */}
      {!isStudent && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Always visible for students */}
      <aside
        className={`${
          isStudent 
            ? 'fixed left-0 top-0 h-screen w-64' 
            : `fixed lg:relative top-0 left-0 h-screen w-64 transition-all duration-300 ${
                !isOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
              } z-40`
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">IAE System</h1>
          <p className="text-xs text-gray-400 mt-1">Course Shifting Module</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => !isStudent && setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-all duration-200 group"
            >
              <span className="text-blue-400 group-hover:text-blue-300">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Student Role Badge */}
        {isStudent && (
          <div className="px-4 py-3 mx-4 mb-4 bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Role</p>
            <p className="text-sm text-blue-100 mt-1">Student</p>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{studentId}</p>
            </div>
          </div>
          <Button
            fullWidth
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            onPress={onLogout}
          >
            <LogoutIcon />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};
