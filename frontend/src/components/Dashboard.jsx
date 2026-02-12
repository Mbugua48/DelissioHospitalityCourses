// c:\Users\Admin\Documents\GitHub\DelissioHospitalityCourses\frontend\src\components\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, Grid, Card, CardContent, CardActionArea, LinearProgress, CardActions } from '@mui/material';
import { useAuth } from '../AuthContext';
import { api } from '../services/authService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('my-progress/');
        setProgressData(response.data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate overall progress for the pie chart
  const totalLessons = progressData.reduce((acc, curr) => acc + curr.total_lessons, 0);
  const totalCompleted = progressData.reduce((acc, curr) => acc + curr.completed_lessons, 0);
  const pieData = [
    { name: 'Completed', value: totalCompleted },
    { name: 'Remaining', value: totalLessons - totalCompleted },
  ];
  const COLORS = ['#4caf50', '#ff9800']; // Green and Orange

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Paper elevation={4} sx={{ p: 5, width: '100%', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Dashboard
              </Typography>
              <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2, textTransform: 'none' }}>
                Logout
              </Button>
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Welcome, {user?.email || 'User'}!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              You are logged in as a {user?.role || 'learner'}.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button component={RouterLink} to="/my-certificates" variant="contained" color="primary">
                View My Certificates
              </Button>
            </Box>

            {progressData.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  My Learning Progress
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom align="center">Overall Progress</Typography>
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                <Grid container spacing={3}>
                  {progressData.map((course) => (
                    <Grid item xs={12} md={6} key={course.id}>
                      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardActionArea component={RouterLink} to={`/courses/${course.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom noWrap>
                              {course.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={course.progress} sx={{ height: 8, borderRadius: 5 }} />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">{`${course.progress}%`}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {course.completed_lessons} of {course.total_lessons} lessons completed
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        {course.next_lesson_id && (
                          <CardActions sx={{ p: 2, pt: 0 }}>
                            <Button 
                              component={RouterLink} 
                              to={`/courses/${course.id}#lesson-${course.next_lesson_id}`}
                              variant="contained" 
                              size="small" 
                              fullWidth
                            >
                              Resume Course
                            </Button>
                          </CardActions>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
