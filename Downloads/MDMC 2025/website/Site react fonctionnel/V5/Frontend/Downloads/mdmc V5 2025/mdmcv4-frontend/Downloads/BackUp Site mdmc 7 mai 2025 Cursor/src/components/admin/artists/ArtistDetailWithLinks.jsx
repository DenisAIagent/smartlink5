import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Link,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Spotify as SpotifyIcon,
  Apple as AppleIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';

const ArtistDetailWithLinks = () => {
  const { artistId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artist, setArtist] = useState(null);
  const [smartLinks, setSmartLinks] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchArtistData();
  }, [artistId]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      const [artistResponse, linksResponse] = await Promise.all([
        axios.get(`/api/v1/artists/${artistId}`),
        axios.get(`/api/v1/smartlinks?artistId=${artistId}`)
      ]);
      setArtist(artistResponse.data);
      setSmartLinks(linksResponse.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    // TODO: Ajouter une notification de succès
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* En-tête de l'artiste */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={artist.image}
                alt={artist.name}
                sx={{ width: 120, height: 120 }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {artist.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {artist.bio}
              </Typography>
              <Box display="flex" gap={1}>
                {artist.socialLinks?.facebook && (
                  <IconButton
                    component={Link}
                    href={artist.socialLinks.facebook}
                    target="_blank"
                    color="primary"
                  >
                    <FacebookIcon />
                  </IconButton>
                )}
                {artist.socialLinks?.instagram && (
                  <IconButton
                    component={Link}
                    href={artist.socialLinks.instagram}
                    target="_blank"
                    color="primary"
                  >
                    <InstagramIcon />
                  </IconButton>
                )}
                {artist.socialLinks?.twitter && (
                  <IconButton
                    component={Link}
                    href={artist.socialLinks.twitter}
                    target="_blank"
                    color="primary"
                  >
                    <TwitterIcon />
                  </IconButton>
                )}
                {artist.socialLinks?.youtube && (
                  <IconButton
                    component={Link}
                    href={artist.socialLinks.youtube}
                    target="_blank"
                    color="primary"
                  >
                    <YouTubeIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Smart Links */}
      <Typography variant="h5" gutterBottom>
        Smart Links
      </Typography>
      <Grid container spacing={3}>
        {smartLinks.map((link) => (
          <Grid item xs={12} md={6} key={link.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {link.title}
                  </Typography>
                  <Chip
                    label={`${link.clicks} clics`}
                    color="primary"
                    size="small"
                  />
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Lien public
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Link
                      href={link.publicUrl}
                      target="_blank"
                      sx={{ flexGrow: 1 }}
                    >
                      {link.publicUrl}
                    </Link>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyLink(link.publicUrl)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Taux de conversion
                    </Typography>
                    <Typography variant="h6">
                      {link.conversionRate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Plateformes
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                      {link.platforms?.spotify && <SpotifyIcon color="success" />}
                      {link.platforms?.apple && <AppleIcon />}
                      {link.platforms?.youtube && <YouTubeIcon color="error" />}
                    </Box>
                  </Grid>
                </Grid>

                {/* Historique des clics */}
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Derniers clics
                  </Typography>
                  {link.recentClicks?.map((click, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={0.5}
                    >
                      <Typography variant="body2">
                        {click.platform}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(click.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ArtistDetailWithLinks; 