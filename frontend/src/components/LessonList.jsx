import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/authService';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Stack, Button, Chip, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Paper } from '@mui/material';
import { Lock, CheckCircle, EmojiEvents } from '@mui/icons-material';
import Confetti from 'react-confetti';

const LessonList = () => {
  const { id } = useParams(); // Assumes route is /courses/:id
  const location = useLocation();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); // { lessonId: { questionId: optionIndex } }
  const [quizResults, setQuizResults] = useState({}); // { lessonId: { passed: bool, score: number } }
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get(`courses/${id}/lessons/`);
        setLessons(response.data);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLessons();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && lessons.length > 0 && location.hash) {
      // Small timeout to ensure rendering is complete
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [loading, lessons, location.hash]);

  const handleComplete = async (lessonId) => {
    try {
      await api.post(`lessons/${lessonId}/complete/`);
      // Update local state to reflect completion immediately
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, is_completed: true } : l));
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
    }
  };

  const handleQuizChange = (lessonId, questionId, value) => {
    setQuizAnswers(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        [questionId]: value
      }
    }));
  };

  const handleSubmitQuiz = async (lessonId) => {
    try {
      const answers = quizAnswers[lessonId] || {};
      const response = await api.post(`lessons/${lessonId}/quiz-submit/`, { answers });
      
      setQuizResults(prev => ({ ...prev, [lessonId]: response.data }));
      
      if (response.data.passed) {
        setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, is_completed: true } : l));
        setShowConfetti(true);
        
        const audio = new Audio('/success.mp3');
        audio.play().catch(e => console.error("Audio play failed", e));
        
        setTimeout(() => setShowConfetti(false), 6000); // Stop showing after 6 seconds
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleRetakeQuiz = (lessonId) => {
    // Clear the result to hide the failure message
    setQuizResults(prev => {
      const newResults = { ...prev };
      delete newResults[lessonId];
      return newResults;
    });
    // Clear answers to force a fresh attempt
    setQuizAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[lessonId];
      return newAnswers;
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const allLessonsCompleted = lessons.length > 0 && lessons.every(l => l.is_completed);

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {showConfetti && (
        <Confetti 
          recycle={false} 
          numberOfPieces={500} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000 }} 
        />
      )}
      <Typography variant="h5" gutterBottom>
        Course Lessons
      </Typography>
      {lessons.length === 0 ? (
        <Typography color="text.secondary">No lessons available yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {lessons.map((lesson, index) => {
            // A lesson is locked if it's not the first one AND the previous one is not completed
            // Set to false to allow guest access to all lessons immediately
            const isLocked = false;

            return (
              <Card id={`lesson-${lesson.id}`} key={lesson.id} variant="outlined" sx={{ opacity: isLocked ? 0.7 : 1, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {lesson.order}. {lesson.title}
                    </Typography>
                    {lesson.is_completed && <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />}
                    {isLocked && <Chip icon={<Lock />} label="Locked" color="default" size="small" />}
                  </Box>

                  {isLocked ? (
                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Lock sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        Complete the previous lesson to unlock this content.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {lesson.content}
                      </Typography>
                      {lesson.image && (
                        <Box component="img" src={lesson.image} alt={lesson.title} sx={{ maxWidth: '100%', maxHeight: 400, borderRadius: 1, mb: 2, display: 'block' }} />
                      )}
                      {lesson.video && (
                        <Box component="video" controls src={lesson.video} sx={{ width: '100%', maxHeight: 500, borderRadius: 1, mb: 2 }} />
                      )}
                      
                      {!lesson.is_completed && lesson.quiz ? (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom>Quiz: Pass to unlock next lesson</Typography>
                          {quizResults[lesson.id] && !quizResults[lesson.id].passed && (
                            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#ffebee', border: '1px solid #ef5350', borderRadius: 2, textAlign: 'center' }}>
                              <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                                Quiz Failed
                              </Typography>
                              <Typography variant="h3" color="error" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {quizResults[lesson.id].score} / {quizResults[lesson.id].total}
                              </Typography>
                              <Typography variant="body1" color="error.dark">
                                You need to pass this quiz to unlock the next lesson. Please try again.
                              </Typography>
                              <Button 
                                variant="outlined" 
                                color="error" 
                                sx={{ mt: 2 }}
                                onClick={() => handleRetakeQuiz(lesson.id)}
                              >
                                Retake Quiz
                              </Button>
                            </Paper>
                          )}
                          
                          {!quizResults[lesson.id] && (
                            <>
                          {lesson.quiz.questions.map(q => {
                            const result = quizResults[lesson.id]?.results?.[q.id];
                            const isSubmitted = !!quizResults[lesson.id];

                            return (
                            <FormControl key={q.id} component="fieldset" sx={{ mb: 2, display: 'block' }} error={isSubmitted && !result?.is_correct}>
                              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {q.text}
                                {isSubmitted && (
                                  result?.is_correct ? 
                                  <Chip label="Correct" color="success" size="small" sx={{ ml: 1, height: 20 }} /> : 
                                  <Chip label="Incorrect" color="error" size="small" sx={{ ml: 1, height: 20 }} />
                                )}
                              </FormLabel>
                              <RadioGroup
                                value={quizAnswers[lesson.id]?.[q.id] || ''}
                                onChange={(e) => handleQuizChange(lesson.id, q.id, e.target.value)}
                              >
                                <FormControlLabel value="1" control={<Radio />} label={q.option1} disabled={isSubmitted} 
                                  sx={isSubmitted && result?.correct_answer === 1 ? { color: 'success.main', '& .MuiTypography-root': { fontWeight: 'bold' } } : {}} 
                                />
                                <FormControlLabel value="2" control={<Radio />} label={q.option2} disabled={isSubmitted} 
                                  sx={isSubmitted && result?.correct_answer === 2 ? { color: 'success.main', '& .MuiTypography-root': { fontWeight: 'bold' } } : {}} 
                                />
                                <FormControlLabel value="3" control={<Radio />} label={q.option3} disabled={isSubmitted} 
                                  sx={isSubmitted && result?.correct_answer === 3 ? { color: 'success.main', '& .MuiTypography-root': { fontWeight: 'bold' } } : {}} 
                                />
                              </RadioGroup>
                            </FormControl>
                          )})}
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleSubmitQuiz(lesson.id)}
                            disabled={!quizAnswers[lesson.id] || Object.keys(quizAnswers[lesson.id]).length < lesson.quiz.questions.length}
                          >
                            Submit Quiz
                          </Button>
                            </>
                          )}
                        </Paper>
                      ) : (
                        !lesson.is_completed && (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleComplete(lesson.id)}
                            fullWidth
                          >
                            Complete & Continue
                          </Button>
                        )
                      )}

                      {lesson.is_completed && lesson.quiz && (
                        <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: 2, textAlign: 'center' }}>
                          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
                          <Typography variant="h5" color="success.main" gutterBottom fontWeight="bold">
                            Lesson Completed!
                          </Typography>
                          {quizResults[lesson.id] && quizResults[lesson.id].passed && (
                            <Typography variant="h4" color="success.dark" sx={{ mb: 1 }}>
                              Score: {quizResults[lesson.id].score} / {quizResults[lesson.id].total}
                            </Typography>
                          )}
                          <Typography variant="body1" color="success.dark">
                            You have successfully passed the quiz.
                          </Typography>
                        </Paper>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
      {allLessonsCompleted && (
        <Paper elevation={4} sx={{ p: 4, mt: 5, textAlign: 'center', bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
            <EmojiEvents sx={{ fontSize: 60, color: 'gold' }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                Congratulations!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                You have completed all lessons in this course.
            </Typography>
            <Button 
                component={RouterLink} 
                to={`/courses/${id}/certificate`} 
                variant="contained" 
                size="large"
                color="success"
            >
                Get Your Certificate
            </Button>
        </Paper>
      )}
    </Box>
  );
};

export default LessonList;