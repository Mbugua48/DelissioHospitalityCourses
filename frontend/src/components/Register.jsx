import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Alert, CircularProgress, Grid, MenuItem, Select, InputLabel, FormControl, Link, IconButton, InputAdornment, Snackbar } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import authService from '../services/authService.js';
import AuthLayout from './AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'learner',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setMessage('');
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        username: formData.email,
        role: formData.role,
      };

      const data = await authService.register(payload);
      navigate('/login', { state: { message: data.message || 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up" avatarIcon={<LockOutlined fontSize="large" />}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3, width: '100%' }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleChange}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="learner">Learner</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
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
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    sx: { borderRadius: 2 },
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
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1rem', textTransform: 'none', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid>
                <Link component={RouterLink} to="/login" variant="body2" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
            <Snackbar open={!!error || !!message} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }} variant="filled">
                {error || message}
              </Alert>
            </Snackbar>
          </Box>
    </AuthLayout>
  );
};

export default Register;