import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Alert, Box, CardActionArea } from '@mui/material';
import { api } from '../services/authService';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Use the 'api' instance which automatically includes the auth token.
        // The backend for this endpoint must be configured to require authentication.
        // NoTE: If there is a 404, ensure this URL matches your Django urls.py exactly.
        const response = await api.get('courses/');
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const errorMessage = error.response?.status === 404
      ? 'API endpoint not found (404). Please check the URL in CourseList.jsx against your backend urls.py.'
      : error.message;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">Error loading courses: {errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 6, fontWeight: 700, color: 'text.primary' }}>
          Available Courses
        </Typography>
        <Grid container spacing={4}>
          {courses.map(course => (
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8, cursor: 'pointer' } }}>
                <CardActionArea component={RouterLink} to={`/courses/${course.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography>
                      {course.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      Instructor: {course.instructor}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default CourseList;
