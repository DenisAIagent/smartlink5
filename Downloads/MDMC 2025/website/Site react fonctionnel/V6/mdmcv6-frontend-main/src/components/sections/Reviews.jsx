import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Container
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import apiService from '../../services/api.service';

const Reviews = () => {
  const { t } = useTranslation();
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.reviews.getReviews({ status: 'approved' });
        if (response.success && response.data) {
          setApprovedReviews(response.data);
        }
      } catch (err) {
        setError(t('reviews.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [t]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % approvedReviews.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + approvedReviews.length) % approvedReviews.length);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ name: '', email: '', rating: 0, message: '' });
    setFormError(null);
    setFormSuccess(false);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError(t('reviews.form.name_required'));
      return false;
    }
    if (!formData.email.trim()) {
      setFormError(t('reviews.form.email_required'));
      return false;
    }
    if (!formData.rating) {
      setFormError(t('reviews.form.rating_required'));
      return false;
    }
    if (!formData.message.trim()) {
      setFormError(t('reviews.form.message_required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await apiService.reviews.createReview(formData);
      if (response.success) {
        setFormSuccess(true);
        setFormData({ name: '', email: '', rating: 0, message: '' });
      } else {
        setFormError(response.message || t('reviews.form.error'));
      }
    } catch (err) {
      setFormError(t('reviews.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="section" id="reviews" sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h2" align="center" gutterBottom>
          {t('reviews.title')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {approvedReviews.length > 0 && (
          <Paper elevation={3} sx={{ p: 4, mb: 4, position: 'relative' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={10}>
                <Box sx={{ textAlign: 'center' }}>
                  <Rating
                    value={approvedReviews[activeIndex]?.rating || 0}
                    readOnly
                    size="large"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                    "{approvedReviews[activeIndex]?.message}"
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {approvedReviews[activeIndex]?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {approvedReviews[activeIndex]?.title}
                  </Typography>
                </Box>
              </Grid>
              {approvedReviews.length > 1 && (
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <IconButton onClick={handlePrev} aria-label="Avis précédent">
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton onClick={handleNext} aria-label="Avis suivant">
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            sx={{ mt: 2 }}
          >
            {t('reviews.leave_review')}
          </Button>
        </Box>

        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t('reviews.leave_review')}
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {formSuccess ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('reviews.form.success')}
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label={t('reviews.form.name')}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label={t('reviews.form.email')}
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  margin="normal"
                  required
                />
                <Box sx={{ my: 2 }}>
                  <Typography component="legend">{t('reviews.form.rating')}</Typography>
                  <Rating
                    value={formData.rating}
                    onChange={handleRatingChange}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth
                  label={t('reviews.form.message')}
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  margin="normal"
                  required
                />
                <DialogActions>
                  <Button onClick={handleCloseModal}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.submitting') : t('common.submit')}
                  </Button>
                </DialogActions>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Reviews;
