// c:\Users\Admin\Documents\GitHub\DelissioHospitalityCourses\frontend\src\App.jsx
import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';

// Import your components
import Login from './components/Login';
import Register from './components/Register';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new component
import LandingPage from './components/LandingPage'; // Import the landing page component
import Certificate from './components/Certificate';
import MyCertificates from './components/MyCertificates';
import Checkout from './components/Checkout';
import { AuthProvider } from './AuthContext';

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar mode={mode} toggleTheme={toggleTheme} />
          <Box component="main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<ForgotPassword />} />
            <Route path="/password-reset/confirm/:uid/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id/certificate" 
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout/:id" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-certificates" 
              element={
                <ProtectedRoute>
                  <MyCertificates />
                </ProtectedRoute>
              } 
            />

            {/* Default route redirects to courses */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Box>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
