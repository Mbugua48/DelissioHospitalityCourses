import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Alert, CircularProgress, IconButton, InputAdornment, Link, Snackbar } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import authService from '../services/authService.js';
import AuthLayout from './AuthLayout';

function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPasswordConfirm({ uid, token, password });
      navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <AuthLayout title="Set New Password" avatarIcon={<LockOutlined />}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign In
            </Link>
          </Box>
          <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }} variant="filled">
              {error}
            </Alert>
          </Snackbar>
        </Box>
    </AuthLayout>
  );
}

export default ResetPassword;