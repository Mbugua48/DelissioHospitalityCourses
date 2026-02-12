import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Link, Snackbar } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../services/authService.js';
import AuthLayout from './AuthLayout';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setMessage('');
  };

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
    <AuthLayout title="Reset Password" avatarIcon={<LockOutlined />}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            Enter your email address and we will send you a link to reset your password.
          </Typography>
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
          <Snackbar open={!!error || !!message} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }} variant="filled">
              {error || message}
            </Alert>
          </Snackbar>
        </Box>
    </AuthLayout>
  );
}

export default ForgotPassword;