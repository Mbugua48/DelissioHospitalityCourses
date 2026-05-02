import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Alert, CircularProgress, Grid, Link, IconButton, InputAdornment, Snackbar } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import AuthLayout from './AuthLayout';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const from = location.state?.from?.pathname || '/dashboard';
  const { login } = useAuth();

  useEffect(() => {
    // This effect clears the location state after reading the message.
    // This prevents the message from reappearing if the user refreshes the page.
    if (location.state?.message) {
      // Replace the current entry in the history stack with the same path but without the state.
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setSuccessMessage('');
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await login({
        email: credentials.email,
        password: credentials.password,
      });
      
      // Redirect to the page they were trying to access, or the dashboard by default
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" avatarIcon={<LockOutlined fontSize="large" />}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={credentials.email}
            onChange={handleChange}
            disabled={loading}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              sx: { borderRadius: 2 },
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1rem', textTransform: 'none', fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid size="grow">
              <Link component={RouterLink} to="/password-reset" variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
          <Snackbar open={!!error || !!successMessage} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }} variant="filled">
              {error || successMessage}
            </Alert>
          </Snackbar>
        </Box>
    </AuthLayout>
  );
};

export default Login;