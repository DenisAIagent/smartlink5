import React from 'react';
import { Switch as MuiSwitch, FormControlLabel } from '@mui/material';

const Switch = ({ label, ...props }) => {
  return <FormControlLabel control={<MuiSwitch {...props} />} label={label} />;
};

export default Switch; 