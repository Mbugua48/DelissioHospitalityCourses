import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Grid, Paper } from '@mui/material';
import { School, RestaurantMenu, People } from '@mui/icons-material';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        }}
      >
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            APTITUDE ACADEMY
          </Typography>
          <Typography variant="h5" sx={{ mb: 5, opacity: 0.9 }}>
            Elevate your culinary skills and hospitality management with our world-class courses and services.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2, fontWeight: 'bold' }}
            >
              Get Started
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem', 
                borderRadius: 2, 
                fontWeight: 'bold',
                color: 'white', 
                borderColor: 'white', 
                '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 4, height: '100%', textAlign: 'center', borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <School color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                Expert Courses
              </Typography>
              <Typography color="text.secondary">
                Learn from industry professionals with our comprehensive curriculum covering all aspects of hospitality.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 4, height: '100%', textAlign: 'center', borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <RestaurantMenu color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                Culinary Excellence
              </Typography>
              <Typography color="text.secondary">
                Master the art of cooking and presentation with hands-on training and modern techniques.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={2} sx={{ p: 4, height: '100%', textAlign: 'center', borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <People color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                Community
              </Typography>
              <Typography color="text.secondary">
                Join a vibrant community of learners and professionals to network and grow your career.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Us Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="bold">
            Contact Us
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph sx={{ mb: 5 }}>
            Have questions about our courses or services? Reach out to our team.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Email
                </Typography>
                <Typography color="text.secondary" component="a" href="mailto:info@aptitudeacademy.com" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                  info@aptitudeacademy.com
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Phone
                </Typography>
                <Typography color="text.secondary">
                  +254 743 815584
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Address
                </Typography>
                <Typography color="text.secondary">
                  123 APTITUDE Building,<br />
                  Food City, Kenya
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8, mt: 'auto' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to start your journey?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Join APTITUDE ACADEMY today and take the first step towards your dream career.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 5, py: 1.5, borderRadius: 2, fontSize: '1rem' }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default LandingPage;