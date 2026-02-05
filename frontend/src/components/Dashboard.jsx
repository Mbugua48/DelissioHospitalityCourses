// c:\Users\Admin\Documents\GitHub\DelissioHospitalityCourses\frontend\src\components\Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper elevation={4} sx={{ p: 5, width: '100%', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Dashboard
              </Typography>
              <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2, textTransform: 'none' }}>
                Logout
              </Button>
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Welcome back, {user?.email || 'User'}!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              You are logged in as a {user?.role || 'learner'}.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
