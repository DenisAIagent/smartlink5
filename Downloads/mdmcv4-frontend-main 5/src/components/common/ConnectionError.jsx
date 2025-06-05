import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import AnimatedButton from './AnimatedButton';

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3),
  background: theme.palette.background.default,
  animation: 'fadeIn 0.5s ease-out',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%)',
  color: theme.palette.primary.main,
  animation: 'pulse 2s infinite',
  '& svg': {
    width: '60px',
    height: '60px',
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 800,
  fontSize: '2rem',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff, #b0b0b0)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
}));

const Message = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: '400px',
  marginBottom: theme.spacing(4),
  lineHeight: 1.6,
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    '& button': {
      width: '100%',
    },
  },
}));

const ConnectionError = ({ onRetry }) => {
  return (
    <ErrorContainer>
      <IconWrapper>
        <WifiOffIcon />
      </IconWrapper>
      <Title>
        Erreur de connexion
      </Title>
      <Message>
        La connexion au serveur a échoué. Veuillez vérifier votre connexion internet ou votre VPN.
        Si le problème persiste, contactez le support technique.
      </Message>
      <ButtonGroup>
        <AnimatedButton
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Réessayer
        </AnimatedButton>
        <AnimatedButton
          variant="outlined"
          onClick={() => window.location.reload()}
        >
          Rafraîchir la page
        </AnimatedButton>
      </ButtonGroup>
    </ErrorContainer>
  );
};

export default ConnectionError; 