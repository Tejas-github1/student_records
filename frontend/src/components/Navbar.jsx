import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, User, Menu } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Admin</span>;
      case 'teacher':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Teacher</span>;
      case 'student':
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Exam<span className="text-blue-600">Portal</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline-block ml-2 border-l border-slate-200 pl-2">
              Academic Assessment Platform
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium text-sm border border-slate-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <p className="text-xs text-slate-500">
                {user.role === 'student' && user.studentId ? `ID: ${user.studentId} • ${user.classGrade}` : user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
