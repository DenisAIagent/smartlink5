import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
  size = 40,
  thickness = 4,
  color = 'primary',
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: overlay ? 'rgba(0, 0, 0, 0.5)' : 'background.paper',
    }),
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={spinnerVariants}
    >
      <Box sx={containerStyle}>
        <CircularProgress
          size={size}
          thickness={thickness}
          color={color}
          sx={{
            mb: message ? 2 : 0,
          }}
        />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 1 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default LoadingSpinner; 