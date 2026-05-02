// c:\Users\Admin\Documents\GitHub\DelissioHospitalityCourses\frontend\src\components\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, Grid, Card, CardContent, CardActionArea, LinearProgress, CardActions, Avatar, Divider, TextField } from '@mui/material';
import { useAuth } from '../AuthContext';
import { api } from '../services/authService';
import { School, Star, Timer, Casino, CheckCircleOutline, Replay, Lightbulb, ArrowForward, ShoppingCart } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  
  // Game state
  const [gameWord, setGameWord] = useState({ original: '', scrambled: '' });
  const [userGuess, setUserGuess] = useState('');
  const [gameFeedback, setGameFeedback] = useState(null);

  const culinaryTerms = ['JULIENNE', 'SOMMELIER', 'CONCIERGE', 'FLAMBE', 'ROUX', 'GANACHE', 'SAUTE', 'COULIS', 'SOUFFLE', 'MISE-EN-PLACE'];

  const initGame = () => {
    const word = culinaryTerms[Math.floor(Math.random() * culinaryTerms.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    setGameWord({ original: word, scrambled });
    setUserGuess('');
    setGameFeedback(null);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('my-progress/');
        setProgressData(response.data);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      }
    };

    const fetchAllCourses = async () => {
      try {
        const response = await api.get('courses/');
        setAllCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch all courses:', err);
      }
    };

    if (user) {
      fetchProgress();
      fetchAllCourses();
    }
    initGame();
  }, [user]);

  const handleCheckGuess = () => {
    if (userGuess.toUpperCase() === gameWord.original) {
      setGameFeedback('correct');
    } else {
      setGameFeedback('wrong');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate overall progress for the pie chart
  const totalLessons = progressData.reduce((acc, curr) => acc + curr.total_lessons, 0);
  const totalCompleted = progressData.reduce((acc, curr) => acc + curr.completed_lessons, 0);
  const coursesCompleted = progressData.filter(c => c.progress === 100).length;

  // Filter recommended courses: courses the user is NOT currently enrolled in
  const enrolledCourseIds = progressData.map(p => p.id);
  const recommendedCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id)).slice(0, 3);

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

            {/* Quick Stats Section */}
            <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <School color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{progressData.length}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Courses</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Star sx={{ color: '#ffc107', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{coursesCompleted}</Typography>
                  <Typography variant="body2" color="textSecondary">Courses Finished</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                  <Timer color="action" sx={{ mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalCompleted * 15}m</Typography>
                  <Typography variant="body2" color="textSecondary">Learning Time</Typography>
                </Paper>
              </Grid>
            </Grid>

            {progressData.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Grid container spacing={4}>
                  {/* Progress Chart */}
                  <Grid item xs={12} md={7}>
                    <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
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
                  </Grid>

                  {/* Daily Word Game */}
                  <Grid item xs={12} md={5}>
                    <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Casino sx={{ mr: 1 }} />
                        <Typography variant="h6">Culinary Term Scramble</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                        Unscramble this industry term to keep your skills sharp!
                      </Typography>
                      
                      <Box sx={{ py: 3, px: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ letterSpacing: 6, fontWeight: 'bold' }}>
                          {gameWord.scrambled}
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type your guess..."
                        value={userGuess}
                        onChange={(e) => setUserGuess(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1, mb: 2 }}
                        onKeyPress={(e) => e.key === 'Enter' && handleCheckGuess()}
                      />

                      {gameFeedback === 'correct' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#4caf50', fontWeight: 'bold' }}>
                          <CheckCircleOutline /> Correct! Well done.
                          <Button size="small" variant="contained" color="success" onClick={initGame} sx={{ ml: 'auto' }}>Next</Button>
                        </Box>
                      ) : (
                        <Button 
                          fullWidth 
                          variant="contained" 
                          color="secondary" 
                          onClick={handleCheckGuess}
                          disabled={!userGuess}
                        >
                          Check Answer
                        </Button>
                      )}
                      {gameFeedback === 'wrong' && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#ff5252' }}>
                          Try again! Hint: It's a common culinary term.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, mt: 6 }}>
                  My Learning Progress
                </Typography>
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

            {/* Recommended Courses Section */}
            {recommendedCourses.length > 0 && (
              <Box sx={{ mt: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Lightbulb sx={{ color: '#ffc107', mr: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Recommended for You
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {recommendedCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', transition: '0.3s', '&:hover': { boxShadow: 3 } }}>
                        <CardActionArea component={RouterLink} to={`/courses/${course.id}`} sx={{ flexGrow: 1 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom color="primary.main">
                              {course.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 3, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden',
                              mb: 2 
                            }}>
                              {course.description}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              Price: KES {course.price}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button 
                            component={RouterLink} 
                            to={`/checkout/${course.id}`}
                            variant="contained" 
                            size="small" 
                            fullWidth
                            startIcon={<ShoppingCart />}
                          >
                            Quick Enroll
                          </Button>
                        </CardActions>
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
