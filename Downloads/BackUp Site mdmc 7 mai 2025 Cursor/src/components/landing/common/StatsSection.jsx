import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const defaultStats = [
  {
    icon: <TrendingUpIcon />,
    value: "48-72h",
    label: "Résultats visibles",
    description: "Premiers résultats visibles après le lancement"
  },
  {
    icon: <PeopleIcon />,
    value: "100%",
    label: "Audience réelle",
    description: "Vues et interactions authentiques"
  },
  {
    icon: <MusicNoteIcon />,
    value: "7-14j",
    label: "Performance optimale",
    description: "Délai pour atteindre les performances maximales"
  },
  {
    icon: <StarIcon />,
    value: "300€",
    label: "Investissement minimum",
    description: "Budget recommandé pour des résultats significatifs"
  }
];

const StatsSection = ({
  title = "Nos résultats parlent d'eux-mêmes",
  subtitle = "Des performances mesurables et authentiques",
  stats = defaultStats,
  backgroundColor,
  textColor,
  iconColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: backgroundColor || theme.palette.background.default,
        color: textColor || theme.palette.text.primary
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 2
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            {subtitle}
          </Typography>
        )}
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Box
                  sx={{
                    color: iconColor || theme.palette.primary.main,
                    mb: 2,
                    '& svg': {
                      fontSize: '3rem'
                    }
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {stat.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection; 