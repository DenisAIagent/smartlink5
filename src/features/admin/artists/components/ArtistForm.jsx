import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, Typography, Paper, Grid } from '@mui/material';
import { artistSchema } from '../schemas/artistSchema';
import SocialLinksInput from './SocialLinksInput';
import ImageUpload from './ImageUpload'; // Assuming ImageUpload is in the same directory or adjust path

// TODO: Replace with actual API call function
// import { createArtistApi, updateArtistApi } from '../../../../services/api';

// Placeholder API functions
const createArtistApi = async (data) => {
  console.log("Simulating API call to CREATE artist:", data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulate success
  return { success: true, data: { ...data, _id: 'new123', slug: 'new-artist-slug' } };
};
const updateArtistApi = async (slug, data) => {
  console.log(`Simulating API call to UPDATE artist (${slug}):`, data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulate success
  return { success: true, data: { ...data, _id: 'existing456', slug: slug } };
};


const ArtistForm = ({ artistData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!artistData;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset // To reset form after submission or on initial load
  } = useForm({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: artistData?.name || '',
      bio: artistData?.bio || '',
      artistImageUrl: artistData?.artistImageUrl || '',
      websiteUrl: artistData?.websiteUrl || '',
      socialLinks: artistData?.socialLinks || []
    }
  });

  // Callback for ImageUpload component
  const handleImageUploadSuccess = (imageUrl) => {
    // Update the form value when image is successfully uploaded
    setValue('artistImageUrl', imageUrl, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      let response;
      if (isEditMode) {
        response = await updateArtistApi(artistData.slug, data);
      } else {
        response = await createArtistApi(data);
      }

      if (response.success) {
        console.log("API Success:", response.data);
        if (onFormSubmitSuccess) {
          onFormSubmitSuccess(response.data); // Pass data back up if needed
        }
        if (!isEditMode) {
             reset(); // Reset form on successful creation
        }
      } else {
        // Handle API error (e.g., display error message)
        console.error("API Error:", response.error);
        // TODO: Show error to user
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // TODO: Show error to user
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Modifier l\'artiste' : 'Ajouter un nouvel artiste'}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              {...register('name')}
              label="Nom de l'artiste"
              required
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register('bio')}
              label="Biographie"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              error={!!errors.bio}
              helperText={errors.bio?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
             {/* Image Upload Component */}
             <ImageUpload 
                onUploadSuccess={handleImageUploadSuccess} 
                initialImageUrl={artistData?.artistImageUrl || null}
             />
             {/* Hidden input to store the URL, managed by ImageUpload's callback */}
             <input type="hidden" {...register('artistImageUrl')} />
             {errors.artistImageUrl && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {errors.artistImageUrl.message}
                </Typography>
             )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('websiteUrl')}
              label="Site Web"
              fullWidth
              variant="outlined"
              error={!!errors.websiteUrl}
              helperText={errors.websiteUrl?.message}
              sx={{ mt: 2 }} // Add margin if needed next to image upload
            />
          </Grid>

          <Grid item xs={12}>
            {/* Social Links Input Component */}
            <SocialLinksInput control={control} register={register} errors={errors} />
          </Grid>

          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Ajouter l\'artiste')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ArtistForm;

