import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboardLoaded from './pages/AdminDashboard';
import AnalystDashboardLoaded from './pages/AnalystDashboard';
// Import other dashboards placeholders if not yet created or create them inline/simulated for now
// To save turns, I'll create simple inline components for Admin/Analyst if I don't create separate files, 
// BUT I said I would create separate files. I will create them in the next turn or bundle them here if possible.
// I will create simple placeholders for Admin/Analyst for now to ensure App.jsx compiles, then update/create them.



// Actually I will write the Admin/Analyst files in this turn too.

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['Instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                {/* Using dynamic import or assumes AdminDashboard.jsx exists */}
                <AdminDashboardLoaded />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyst"
            element={
              <ProtectedRoute allowedRoles={['Data_Analyst']}>
                <AnalystDashboardLoaded />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};


export default App;
