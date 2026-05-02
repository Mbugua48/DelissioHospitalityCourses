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

        <Box>
          <LessonList />
        </Box>
      </Container>
    </Box>
  );
};

export default CourseDetail;