import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({
  open,
  onClose,
  message,
  title,
  type = 'info',
  duration = 6000,
  position = {
    vertical: 'top',
    horizontal: 'right',
  },
}) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
          <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={handleClose}
            anchorOrigin={position}
          >
            <Alert
              onClose={handleClose}
              severity={getSeverity(type)}
              variant="filled"
              sx={{
                width: '100%',
                boxShadow: 3,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {title && <AlertTitle>{title}</AlertTitle>}
              {message}
            </Alert>
          </Snackbar>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 