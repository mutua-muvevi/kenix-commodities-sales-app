'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Avatar,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  CreateCategoryData,
} from '@/lib/api/categories';
import { handleApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import FormProvider from '@/components/hook-form/form-provider';

const categorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  parent: z.string().optional(),
  displayOrder: z.number().min(0, 'Display order must be positive').optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: '',
      description: '',
      image: '',
      parent: '',
      displayOrder: 0,
      isActive: true,
    },
  });

  const { control, handleSubmit, reset } = methods;

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
      });

      // Handle response whether it has pagination or not
      if (response.data?.items) {
        setCategories(response.data.items);
        setTotalCount(response.data.pagination?.totalCount || response.data.items.length);
      } else if (Array.isArray(response.data)) {
        setCategories(response.data);
        setTotalCount(response.data.length);
      } else {
        setCategories([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching categories:', handleApiError(error));
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await getCategories({ isActive: true });
      const data = response.data?.items || response.data || [];
      setParentCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching parent categories:', handleApiError(error));
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        categoryName: category.categoryName,
        description: category.description || '',
        image: category.image || '',
        parent: typeof category.parent === 'string' ? category.parent : category.parent?._id || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== false,
      });
    } else {
      setEditingCategory(null);
      reset({
        categoryName: '',
        description: '',
        image: '',
        parent: '',
        displayOrder: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Clean up empty strings
      const cleanData: CreateCategoryData = {
        categoryName: data.categoryName,
        description: data.description || undefined,
        image: data.image || undefined,
        parent: data.parent || undefined,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, cleanData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(cleanData);
        toast.success('Category created successfully');
      }
      handleCloseDialog();
      fetchCategories();
      fetchParentCategories(); // Refresh parent categories list
    } catch (error) {
      console.error('Error saving category:', handleApiError(error));
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
      fetchParentCategories(); // Refresh parent categories list
    } catch (error) {
      console.error('Error deleting category:', handleApiError(error));
      toast.error('Failed to delete category');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getParentName = (parent?: string | Category): string => {
    if (!parent) return '-';
    if (typeof parent === 'string') {
      const found = parentCategories.find((cat) => cat._id === parent);
      return found?.categoryName || '-';
    }
    return parent.categoryName;
  };

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Categories Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize your products into categories and subcategories
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Parent Category</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Display Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No categories found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={category.image}
                          alt={category.categoryName}
                          variant="rounded"
                          sx={{ bgcolor: 'primary.light' }}
                        >
                          <CategoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {category.categoryName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description
                          ? category.description.length > 60
                            ? category.description.substring(0, 60) + '...'
                            : category.description
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getParentName(category.parent)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${category.productsCount || 0} products`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{category.displayOrder || 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive !== false ? 'Active' : 'Inactive'}
                        size="small"
                        color={category.isActive !== false ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(category)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="categoryName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Category Name"
                      fullWidth
                      required
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="image"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      fullWidth
                      error={!!error}
                      helperText={error?.message || 'Optional: Enter a valid image URL'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="parent"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Parent Category</InputLabel>
                      <Select {...field} label="Parent Category">
                        <MenuItem value="">
                          <em>None (Top Level)</em>
                        </MenuItem>
                        {parentCategories
                          .filter((cat) => cat._id !== editingCategory?._id)
                          .map((cat) => (
                            <MenuItem key={cat._id} value={cat._id}>
                              {cat.categoryName}
                            </MenuItem>
                          ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="displayOrder"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Display Order"
                      type="number"
                      fullWidth
                      error={!!error}
                      helperText={error?.message || 'Lower numbers appear first'}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Active"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{categoryToDelete?.categoryName}&quot;? This action
            cannot be undone.
          </Typography>
          {categoryToDelete && categoryToDelete.productsCount && categoryToDelete.productsCount > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              Warning: This category has {categoryToDelete.productsCount} product(s) associated
              with it.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
