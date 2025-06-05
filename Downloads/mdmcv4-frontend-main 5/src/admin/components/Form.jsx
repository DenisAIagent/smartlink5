import React from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Form = ({ children, onSubmit, initialValues = {} }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

Form.Input = ({ name, label, required, type = 'text' }) => (
  <TextField
    fullWidth
    name={name}
    label={label}
    required={required}
    type={type}
    variant="outlined"
    margin="normal"
  />
);

Form.Select = ({ name, label, options, required }) => (
  <FormControl fullWidth margin="normal" required={required}>
    <InputLabel>{label}</InputLabel>
    <Select name={name} label={label}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default Form; 