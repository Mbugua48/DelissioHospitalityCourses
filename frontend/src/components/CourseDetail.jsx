import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button, CircularProgress, Alert, Divider } from '@mui/material';
import { api } from '../services/authService';
import LessonList from './LessonList';
import { ShoppingCart, PlayCircleOutline } from '@mui/icons-material';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

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
        <Button component={RouterLink} to="/courses" sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </Container>
    );
  }

  if (!course) return null;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Button component={RouterLink} to="/courses" sx={{ mb: 2 }}>
          &larr; Back to Courses
        </Button>
        
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {course.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
            <Typography variant="subtitle1" sx={{ mr: 3 }}>
              <strong>Instructor:</strong> {course.instructor}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Date:</strong> {new Date(course.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {course.description}
          </Typography>
        </Paper>

        {course.is_enrolled || showPreview ? (
          <Box>
            {!course.is_enrolled && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You are viewing a free preview of the first lesson. <Button component={RouterLink} to={`/checkout/${id}`} size="small" sx={{ fontWeight: 'bold' }}>Enroll Now</Button> to unlock the full course.
              </Alert>
            )}
            <LessonList />
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Ready to start learning?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enroll in this course to access all lessons, quizzes, and your certificate of completion.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Button component={RouterLink} to={`/checkout/${id}`} variant="contained" size="large" startIcon={<ShoppingCart />} sx={{ minWidth: 250 }}>
                Enroll Now for KES {course.price}
              </Button>
              <Button variant="outlined" size="large" startIcon={<PlayCircleOutline />} onClick={() => setShowPreview(true)} sx={{ minWidth: 250 }}>
                Watch Free Preview
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default CourseDetail;