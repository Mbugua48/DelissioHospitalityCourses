import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link } from '@mui/material';
import Register from '../components/Register.jsx';

function RegisterPage() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px', // or whatever width you want
        }}
      >
        <Register />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Already have an account? Sign in
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default RegisterPage;