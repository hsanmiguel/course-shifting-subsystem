import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@heroui/react';
import {
  ClipboardList,
  FilePenLine,
  GitCompareArrows,
  LayoutDashboard,
  LogOut,
  Menu,
} from 'lucide-react';

interface SideNavProps {
  userRole?: 'student' | 'admin';
  userName?: string;
  studentId?: string;
  onLogout?: () => void;
}

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
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'My Request',
      href: '/student/applications',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      label: 'Application Form',
      href: '/student/application-form',
      icon: <FilePenLine className="h-5 w-5" />,
    },
    {
      label: 'Course Equivalencies',
      href: '/student/course-equivalencies',
      icon: <GitCompareArrows className="h-5 w-5" />,
    },
  ];

  const adminNavItems = [
    {
      label: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Menu Button - Hidden for students (static sidebar) */}
      {!isStudent && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 rounded-md bg-slate-900 p-2 text-white"
        >
          <Menu className="h-6 w-6" />
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
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => !isStudent && setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md border-l-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-transparent bg-slate-700/80 text-white shadow-sm'
                    : 'border-transparent text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-100'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Student Role Badge */}
        {isStudent && (
          <div className="mx-4 mb-4 rounded-md border border-slate-600 bg-slate-800 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
            <p className="mt-1 text-sm text-slate-100">Student</p>
          </div>
        )}

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{studentId}</p>
            </div>
          </div>
          <Button
            fullWidth
            className="rounded-md bg-red-800 text-sm font-medium text-white hover:bg-red-900"
            onPress={onLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};
