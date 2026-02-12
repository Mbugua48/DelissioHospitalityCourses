import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../services/authService';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Grid, Button, Card, CardContent, CardActions } from '@mui/material';
import { EmojiEvents, ArrowForward } from '@mui/icons-material';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await api.get('my-certificates/');
        setCertificates(response.data);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('Failed to load certificates.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          My Certificates
        </Typography>

        {certificates.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't earned any certificates yet.
            </Typography>
            <Button component={RouterLink} to="/courses" variant="contained" sx={{ mt: 2 }}>
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {certificates.map((cert) => (
              <Grid item xs={12} sm={6} md={4} key={cert.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                    <EmojiEvents sx={{ fontSize: 60, color: 'gold', mb: 2 }} />
                    <Typography variant="h6" component="h2" gutterBottom>
                      {cert.course_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issued on: {new Date(cert.issued_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button 
                      component={RouterLink} 
                      to={`/courses/${cert.course_id}/certificate`} 
                      size="small" 
                      variant="outlined"
                      endIcon={<ArrowForward />}
                    >
                      View Certificate
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MyCertificates;