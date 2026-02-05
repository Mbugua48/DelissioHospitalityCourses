import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Avatar, Link } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../services/authService.js';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message || 'Password reset link sent. Please check your email.');
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'grey.50',
      }}
    >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 450,
            width: '100%',
            borderRadius: 3,
            mx: { xs: 2, md: 4 },
            animation: 'fadeIn 0.6s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            Enter your email address and we will send you a link to reset your password.
          </Typography>
          {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;