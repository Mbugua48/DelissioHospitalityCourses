import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/authService';
import { Box, Container, Typography, Paper, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { EmojiEvents, Download } from '@mui/icons-material';
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
          p: { xs: 3, md: 6 }, 
          width: '100%', 
          maxWidth: '800px', 
          border: '10px solid', 
          borderColor: 'primary.main', 
          textAlign: 'center', 
          position: 'relative',
          bgcolor: 'background.paper'
        }}
      >
        <EmojiEvents sx={{ fontSize: { xs: 50, md: 80 }, color: 'gold', position: 'absolute', top: { xs: 10, md: 20 }, right: { xs: 10, md: 20 } }} />
        <Typography variant="h2" gutterBottom sx={{ fontFamily: 'serif', color: 'primary.dark' }}>
          Certificate of Completion
        </Typography>
        <Typography variant="h6" sx={{ my: 3 }}>
          This certificate is proudly presented to
        </Typography>
        <Typography variant="h3" gutterBottom sx={{ fontFamily: 'cursive', color: 'secondary.main' }}>
          {certificate.user_name || 'Valued Learner'}
        </Typography>
        <Typography variant="h6" sx={{ my: 3 }}>
          for successfully completing the course
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {certificate.course_title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
          Issued on: {new Date(certificate.issued_at).toLocaleDateString()}
        </Typography>
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