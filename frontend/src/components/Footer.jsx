import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, X, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Delissio Hospitality
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elevating culinary excellence through world-class education and community.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/courses" variant="body2" color="text.secondary" display="block">
              Courses
            </Link>
            <Link component={RouterLink} to="/register" variant="body2" color="text.secondary" display="block">
              Sign Up
            </Link>
            <Link component={RouterLink} to="/login" variant="body2" color="text.secondary" display="block">
              Login
            </Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect With Us
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="X">
                <X />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" component={RouterLink} to="/">
              Delissio Hospitality
            </Link>{' '}
            {new Date().getFullYear()}
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;