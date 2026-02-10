import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home redirect component
const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case 'Student':
      return <Navigate to="/student" replace />;
    case 'Instructor':
      return <Navigate to="/instructor" replace />;
    case 'Data_Analyst':
      return <Navigate to="/analyst" replace />;
    case 'Administrator':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<HomeRedirect />} />
              
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/instructor/*"
                element={
                  <ProtectedRoute allowedRoles={['Instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/analyst"
                element={
                  <ProtectedRoute allowedRoles={['Data_Analyst']}>
                    <AnalystDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['Administrator']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;