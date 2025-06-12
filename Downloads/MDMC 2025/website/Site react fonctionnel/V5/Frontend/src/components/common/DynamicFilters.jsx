import React, { memo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const DynamicFilters = memo(({ onFilterChange, initialFilters = {} }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: initialFilters.dateRange || [new Date(), new Date()],
    metrics: initialFilters.metrics || [],
    threshold: initialFilters.threshold || 50,
    type: initialFilters.type || 'all',
    search: initialFilters.search || '',
    ...initialFilters
  });

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleDateChange = useCallback((dates) => {
    handleFilterChange('dateRange', dates);
  }, [handleFilterChange]);

  const handleMetricToggle = useCallback((metric) => {
    const newMetrics = filters.metrics.includes(metric)
      ? filters.metrics.filter(m => m !== metric)
      : [...filters.metrics, metric];
    handleFilterChange('metrics', newMetrics);
  }, [filters.metrics, handleFilterChange]);

  const handleThresholdChange = useCallback((_, value) => {
    handleFilterChange('threshold', value);
  }, [handleFilterChange]);

  const handleTypeChange = useCallback((event) => {
    handleFilterChange('type', event.target.value);
  }, [handleFilterChange]);

  const handleSearchChange = useCallback((event) => {
    handleFilterChange('search', event.target.value);
  }, [handleFilterChange]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: theme.palette.background.paper,
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6">
          Filtres
        </Typography>
        <IconButton onClick={toggleExpand}>
          {isExpanded ? <CloseIcon /> : <FilterListIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date Range */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Date de début"
                value={filters.dateRange[0]}
                onChange={(date) => handleDateChange([date, filters.dateRange[1]])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="Date de fin"
                value={filters.dateRange[1]}
                onChange={(date) => handleDateChange([filters.dateRange[0], date])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          {/* Metrics */}
          <Box>
            <Typography gutterBottom>Métriques</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Performance', 'Sécurité', 'Accessibilité', 'Qualité'].map((metric) => (
                <Chip
                  key={metric}
                  label={metric}
                  onClick={() => handleMetricToggle(metric)}
                  color={filters.metrics.includes(metric) ? 'primary' : 'default'}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Threshold */}
          <Box>
            <Typography gutterBottom>
              Seuil: {filters.threshold}%
            </Typography>
            <Slider
              value={filters.threshold}
              onChange={handleThresholdChange}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' }
              ]}
            />
          </Box>

          {/* Type */}
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              onChange={handleTypeChange}
              label="Type"
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="error">Erreurs</MenuItem>
              <MenuItem value="warning">Avertissements</MenuItem>
              <MenuItem value="info">Informations</MenuItem>
            </Select>
          </FormControl>

          {/* Search */}
          <TextField
            fullWidth
            label="Rechercher"
            value={filters.search}
            onChange={handleSearchChange}
            variant="outlined"
          />
        </Box>
      </Collapse>
    </Paper>
  );
});

DynamicFilters.displayName = 'DynamicFilters';

export default DynamicFilters; 