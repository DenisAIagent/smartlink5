import React from 'react';
import { Box, Grid, Typography, TextField, Card, CardMedia } from '@mui/material';
import { Controller } from 'react-hook-form';

const MetadataSection = ({ metadata, control, setValue }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Métadonnées du morceau
      </Typography>
      
      <Grid container spacing={3}>
        {/* Pochette de l'album */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardMedia
              component="img"
              image={metadata.artwork || 'https://via.placeholder.com/300x300?text=Pochette+non+disponible'}
              alt={metadata.title}
              sx={{ height: 300, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        {/* Informations du morceau */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Le titre est requis" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Titre du morceau"
                    variant="outlined"
                    fullWidth
                    required
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="artist"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Artiste"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="isrc"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="ISRC"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="label"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Label"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.label || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('label', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="distributor"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Distributeur"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.distributor || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('distributor', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="releaseDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Date de sortie"
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ""}
                    value={field.value || metadata.releaseDate || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('releaseDate', e.target.value);
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetadataSection;
