import React from 'react';
import { Modal as MuiModal, Box, Typography } from '@mui/material';

const Modal = ({ open, onClose, title, children, ...props }) => {
  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      {...props}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        {title && (
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </MuiModal>
  );
};

export default Modal; 