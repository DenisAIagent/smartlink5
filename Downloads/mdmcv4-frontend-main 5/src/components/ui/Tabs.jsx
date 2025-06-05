import React from 'react';
import { Tabs as MuiTabs, Tab, Box } from '@mui/material';

const Tabs = ({ tabs, value, onChange, ...props }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <MuiTabs value={value} onChange={onChange} {...props}>
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </MuiTabs>
    </Box>
  );
};

export default Tabs; 