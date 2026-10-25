import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamRoom } from './pages/student/ExamRoom';
import { ExamResult } from './pages/student/ExamResult';
import { StudentProgress } from './pages/student/StudentProgress';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminExams } from './pages/admin/AdminExams';
import { AdminResults } from './pages/admin/AdminResults';
import { ClassProgress } from './pages/admin/ClassProgress';
import { AdminNotifications } from './pages/admin/AdminNotifications';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

// Root redirector based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes inside App Layout */}
          <Route element={<Layout />}>
            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exam/:id" element={<ExamRoom />} />
              <Route path="/student/progress" element={<StudentProgress />} />
            </Route>

            {/* Results can be viewed by student, teacher, or admin */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
              <Route path="/student/result/:attemptId" element={<ExamResult />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/results" element={<AdminResults />} />
              <Route path="/admin/progress" element={<ClassProgress />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>

            {/* Teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/students" element={<AdminStudents />} />
              <Route path="/teacher/exams" element={<AdminExams />} />
              <Route path="/teacher/results" element={<AdminResults />} />
              <Route path="/teacher/progress" element={<ClassProgress />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
