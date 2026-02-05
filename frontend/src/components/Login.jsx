import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Avatar, Grid, Link, IconButton, InputAdornment } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../AuthContext';

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
      // The backend expects 'username' and 'password'.
      // Since we registered with email as username, we map email input to username here.
      await login({
        username: credentials.email,
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
            maxWidth: 480,
            width: '100%',
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
        <Box component="img" src="/delisio%20couses.png" alt="Logo" sx={{ width: 88, mb: 1 }} />
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlined fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {successMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
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
            <Grid item xs>
              <Link component={RouterLink} to="/password-reset" variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;