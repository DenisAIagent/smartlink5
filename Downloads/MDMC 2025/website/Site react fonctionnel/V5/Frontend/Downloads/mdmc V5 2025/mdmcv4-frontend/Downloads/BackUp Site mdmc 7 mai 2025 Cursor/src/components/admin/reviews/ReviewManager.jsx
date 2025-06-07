import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  const theme = useTheme();

  useEffect(() => {
    fetchReviews();
  }, [page, rowsPerPage, orderBy, order, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/reviews', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortOrder: order,
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined
        }
      });
      setReviews(response.data.reviews);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des avis');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await axios.put(`/api/v1/reviews/${reviewId}`, {
        status: newStatus
      });
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? { ...review, status: newStatus }
            : review
        )
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Gestion des Avis
          </Typography>

          {/* Filtres */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  search: e.target.value
                }))}
                InputProps={{
                  startAdornment: <FilterListIcon color="action" />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  label="Statut"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="approved">Approuvés</MenuItem>
                  <MenuItem value="rejected">Rejetés</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Tableau des avis */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'email'}
                      direction={orderBy === 'email' ? order : 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Avis</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      {new Date(review.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{review.email}</TableCell>
                    <TableCell>{review.content}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {[...Array(5)].map((_, index) => (
                          <StarIcon
                            key={index}
                            sx={{
                              color: index < review.rating
                                ? theme.palette.warning.main
                                : theme.palette.grey[300]
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(review.status)}
                        sx={{
                          backgroundColor: getStatusColor(review.status),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          color="success"
                          onClick={() => handleStatusChange(review.id, 'approved')}
                          disabled={review.status === 'approved'}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleStatusChange(review.id, 'rejected')}
                          disabled={review.status === 'rejected'}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={-1}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewManager; 