import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminExamsPage from './pages/AdminExamsPage';
import AdminExamDetailPage from './pages/AdminExamDetailPage';
import ExaminerDashboardPage from './pages/ExaminerDashboardPage';
import ExaminerExamDetailPage from './pages/ExaminerExamDetailPage';
import OnScreenMarkingPage from './pages/OnScreenMarkingPage';
import ModeratorDashboardPage from './pages/ModeratorDashboardPage';
import ResultSummaryPage from './pages/ResultSummaryPage';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'EXAMINER') return <Navigate to="/examiner/dashboard" replace />;
    if (user.role === 'MODERATOR') return <Navigate to="/moderator/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Root redirector based on authentication
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'EXAMINER') return <Navigate to="/examiner/dashboard" replace />;
  if (user.role === 'MODERATOR') return <Navigate to="/moderator/dashboard" replace />;

  return <Navigate to="/examiner/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root dynamic redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Layout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER']}>
                  <AdminExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER']}>
                  <AdminExamDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Examiner Routes */}
            <Route
              path="/examiner/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER']}>
                  <ExaminerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/examiner/exams/:examId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER']}>
                  <ExaminerExamDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/examiner/answer-sheets/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER']}>
                  <OnScreenMarkingPage />
                </ProtectedRoute>
              }
            />

            {/* Moderator Routes */}
            <Route
              path="/moderator/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <ModeratorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Result Summary */}
            <Route
              path="/results/:answerSheetId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'EXAMINER', 'MODERATOR', 'STUDENT']}>
                  <ResultSummaryPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
