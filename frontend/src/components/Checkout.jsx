// c:\Users\Admin\Documents\GitHub\DelissioHospitalityCourses\frontend\src\components\Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, CircularProgress, Alert, TextField, Grid, Divider } from '@mui/material';
import { CreditCard, Lock } from '@mui/icons-material';
import { api } from '../services/authService';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call backend to enroll
      await api.post(`courses/${id}/enroll/`);
      
      // Redirect to course page
      navigate(`/courses/${id}`);
    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!course) return null;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Secure Checkout
        </Typography>
        
        <Grid container spacing={4}>
          {/* Order Summary */}
          <Grid item xs={12} md={5} order={{ xs: 2, md: 1 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold">{course.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Instructor: {course.instructor}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">${course.price}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Payment Form */}
          <Grid item xs={12} md={7} order={{ xs: 1, md: 2 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Payment Details</Typography>
              </Box>
              
              <Box component="form" onSubmit={handlePayment}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Cardholder Name" fullWidth required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Card Number" fullWidth required placeholder="0000 0000 0000 0000" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Expiry Date" fullWidth required placeholder="MM/YY" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="CVV" fullWidth required type="password" />
                  </Grid>
                </Grid>

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large" 
                  disabled={processing}
                  startIcon={!processing && <Lock />}
                  sx={{ mt: 4, py: 1.5 }}
                >
                  {processing ? <CircularProgress size={24} color="inherit" /> : `Pay $${course.price}`}
                </Button>
                
                <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                  This is a secure 256-bit SSL encrypted payment.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
