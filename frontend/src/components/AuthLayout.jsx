import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';

const AuthLayout = ({ children, title, avatarIcon }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: { xs: 480, sm: 560 },
          borderRadius: 3,
          mx: { xs: 2, md: 4 },
          bgcolor: 'background.paper',
          boxShadow: 6,
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Box component="img" src="/aptitude-logo.png" alt="APTITUDE ACADEMY Logo" sx={{ width: { xs: 88, sm: 92 }, mb: 1 }} />
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>{avatarIcon}</Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>{title}</Typography>
        {children}
      </Paper>
    </Box>
  );
};

export default AuthLayout;