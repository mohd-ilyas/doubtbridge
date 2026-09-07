import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, RoleRoute } from './components/auth/RouteGuards';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentDoubtForm } from './pages/student/StudentDoubtForm';
import { StudentDoubtDetail } from './pages/student/StudentDoubtDetail';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyDoubtDetail } from './pages/faculty/FacultyDoubtDetail';
import { FacultySettings } from './pages/faculty/FacultySettings';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFacultyCreator } from './pages/admin/AdminFacultyCreator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                
                {/* Student Routes */}
                <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/doubts/new" element={<StudentDoubtForm />} />
                  <Route path="/student/doubts/:id" element={<StudentDoubtDetail />} />
                </Route>

                {/* Faculty Routes */}
                <Route element={<RoleRoute allowedRoles={['FACULTY']} />}>
                  <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                  <Route path="/faculty/doubts/:id" element={<FacultyDoubtDetail />} />
                  <Route path="/faculty/settings" element={<FacultySettings />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/faculty" element={<AdminFacultyCreator />} />
                </Route>

              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
