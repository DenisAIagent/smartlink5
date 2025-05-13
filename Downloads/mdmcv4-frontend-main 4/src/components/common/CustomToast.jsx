import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const ToastContainer = styled(Box)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  border: `1px solid ${theme.palette[type]?.main || theme.palette.primary.main}`,
  animation: 'fadeIn 0.3s ease-out',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  minWidth: '300px',
  maxWidth: '400px',
}));

const IconWrapper = styled(Box)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  marginRight: theme.spacing(2),
  backgroundColor: `${theme.palette[type]?.main || theme.palette.primary.main}15`,
  color: theme.palette[type]?.main || theme.palette.primary.main,
  animation: 'pulse 2s infinite',
}));

const ContentWrapper = styled(Box)({
  flex: 1,
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

const CustomToast = ({ message, type = 'info', onClose }) => {
  return (
    <ToastContainer type={type}>
      <IconWrapper type={type}>
        {getIcon(type)}
      </IconWrapper>
      <ContentWrapper>
        <Typography variant="body1" color="text.primary">
          {message}
        </Typography>
      </ContentWrapper>
      {onClose && (
        <CloseButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      )}
    </ToastContainer>
  );
};

export default CustomToast; 