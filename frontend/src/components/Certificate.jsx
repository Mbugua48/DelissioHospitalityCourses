import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/authService';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Button, Stack, Divider } from '@mui/material';
import { EmojiEvents, Download, Verified, WorkspacePremium } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = () => {
  const { id } = useParams(); // course id
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await api.get(`courses/${id}/certificate/`);
        setCertificate(response.data);
      } catch (err) {
        console.error('Error fetching certificate:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('An error occurred while trying to retrieve your certificate.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  const handleDownloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape, mm, A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let imgWidth = pdfWidth;
      let imgHeight = pdfHeight;

      if (ratio > pdfRatio) {
        imgHeight = pdfWidth / ratio;
      } else {
        imgWidth = pdfHeight * ratio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Certificate-${certificate.course_title}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">{error}</Alert>
        <Button component={RouterLink} to={`/courses/${id}`} sx={{ mt: 2 }}>
          &larr; Back to Course
        </Button>
      </Container>
    );
  }

  if (!certificate) return null;

  return (
    <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper 
        ref={certificateRef}
        elevation={10} 
        sx={{ 
          p: { xs: 2, md: 1 }, 
          width: '100%', 
          maxWidth: '850px', 
          border: '2px solid #c5a059', // Metallic Gold
          bgcolor: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Inner Decorative Frame */}
        <Box sx={{ 
          border: '12px double #1a237e', // Navy Blue Double Border
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          height: '100%',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.04,
            backgroundImage: 'url("/aptitude-logo.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '400px',
            zIndex: 0
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <WorkspacePremium sx={{ fontSize: 60, color: '#c5a059', mb: 2 }} />
            
            <Typography variant="h6" sx={{ letterSpacing: 4, textTransform: 'uppercase', color: '#1a237e', fontWeight: 700, mb: 1 }}>
              APTITUDE ACADEMY
            </Typography>
            
            <Typography variant="h2" gutterBottom sx={{ fontFamily: '"Playfair Display", serif', color: '#1a237e', fontWeight: 'bold', mb: 4 }}>
              Certificate of Completion
            </Typography>

            <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1.2rem', mb: 1 }}>
              This is to certify that
            </Typography>

            <Typography variant="h3" gutterBottom sx={{ fontFamily: '"Dancing Script", cursive', color: '#c5a059', py: 2, borderBottom: '1px solid #eee', width: 'fit-content', mx: 'auto', minWidth: '300px' }}>
              {certificate.user_name || 'Valued Learner'}
            </Typography>

            <Typography variant="body1" sx={{ fontSize: '1.1rem', mt: 3, mb: 1 }}>
              has successfully completed all requirements for
            </Typography>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#333', mb: 4 }}>
              {certificate.course_title}
            </Typography>

            <Stack direction="row" justifyContent="space-around" alignItems="flex-end" sx={{ mt: 8 }}>
              <Box sx={{ width: '180px' }}>
                <Typography variant="body2" sx={{ fontFamily: '"Dancing Script", cursive', mb: 0, fontSize: '1.2rem' }}>
                  {certificate.instructor_name}
                </Typography>
                <Divider sx={{ mb: 1, borderColor: '#333' }} />
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Lead Instructor
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Verified sx={{ fontSize: 70, color: '#c5a059', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                  ID: {id}-{new Date(certificate.issued_at).getTime().toString().slice(-6)}
                </Typography>
              </Box>

              <Box sx={{ width: '180px' }}>
                <Typography variant="body2" sx={{ fontFamily: '"Dancing Script", cursive', mb: 0, fontSize: '1.2rem' }}>
                  A. N. Mutuga
                </Typography>
                <Divider sx={{ mb: 1, borderColor: '#333' }} />
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Academic Director
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 6 }}>
              Issued on this day: {new Date(certificate.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="contained" size="large" startIcon={<Download />} onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button component={RouterLink} to={`/courses/${id}`} variant="outlined" size="large">
          Back to Course
        </Button>
      </Stack>
    </Container>
  );
};

export default Certificate;