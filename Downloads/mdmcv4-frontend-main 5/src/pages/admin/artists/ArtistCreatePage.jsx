import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { createArtist } from '../../../services/artists.service';

const ArtistCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createArtist(formData);
      navigate('/admin/artists');
    } catch (error) {
      console.error('Error creating artist:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Créer un nouvel artiste
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom de l'artiste"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="URL de l'image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Créer
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/artists')}
            >
              Annuler
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default ArtistCreatePage; 