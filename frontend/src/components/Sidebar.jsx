import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Award,
  TrendingUp,
  Bell,
  BookOpen,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/exams', label: 'Examinations', icon: FileCheck2 },
    { to: '/admin/results', label: 'Results & Reports', icon: Award },
    { to: '/admin/progress', label: 'Class Progress', icon: TrendingUp },
    { to: '/admin/notifications', label: 'WhatsApp Alerts', icon: Bell },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'Assigned Students', icon: Users },
    { to: '/teacher/exams', label: 'Examinations', icon: FileCheck2 },
    { to: '/teacher/results', label: 'Exam Results', icon: Award },
    { to: '/teacher/progress', label: 'Class Performance', icon: TrendingUp },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Examinations', icon: BookOpen },
    { to: '/student/progress', label: 'My Academic Progress', icon: TrendingUp },
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 px-2 border-b border-slate-100 md:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
              <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Administration' : isTeacher ? 'Teacher Portal' : 'Student Center'}
            </div>

            <nav className="mt-2 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-500/5'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-600">System Online</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              WhatsApp Fail Alert Active
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
