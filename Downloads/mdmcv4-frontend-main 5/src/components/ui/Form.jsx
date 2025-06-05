import React from 'react';
import { Box, TextField, FormControl, FormLabel, FormHelperText } from '@mui/material';

const Form = ({ children, onSubmit, ...props }) => {
  return (
    <Box component="form" onSubmit={onSubmit} {...props}>
      {children}
    </Box>
  );
};

Form.Field = ({ label, error, helperText, ...props }) => {
  return (
    <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
      {label && <FormLabel>{label}</FormLabel>}
      <TextField {...props} />
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default Form; 