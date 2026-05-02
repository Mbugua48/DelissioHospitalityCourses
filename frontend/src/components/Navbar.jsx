import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useAuth } from '../AuthContext';

const Navbar = ({ mode, toggleTheme }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

    return (
      <AppBar position="static">
        <Toolbar>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
            <Box component="img" src="/aptitude-logo.png" alt="APTITUDE ACADEMY Logo" sx={{ height: 40, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              APTITUDE ACADEMY
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={mode === 'light' ? 'Switch to dark' : 'Switch to light'}>
              <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard" sx={{ textTransform: 'none', fontSize: '1rem', mx: 1 }}>
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/courses" sx={{ textTransform: 'none', fontSize: '1rem', mx: 1 }}>
                Courses
              </Button>
              <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none', fontSize: '1rem', mx: 1, border: '1px solid rgba(255,255,255,0.5)', borderRadius: 2 }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;