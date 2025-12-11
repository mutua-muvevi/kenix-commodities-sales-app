const express = require('express');
const router = express.Router();

const { createCategory } = require('../controllers/categories/create');
const { getAllCategories } = require('../controllers/categories/getAll');
const { getCategoryById } = require('../controllers/categories/getById');
const { updateCategory } = require('../controllers/categories/update');
const { deleteCategory } = require('../controllers/categories/delete');
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { isAdmin, checkRole } = require('../middleware/rbac/checkRole');
const { validateBody, validateQuery, validateObjectId } = require('../middleware/validation/validateRequest');
const { createCategorySchema, updateCategorySchema, categoryQuerySchema } = require('../validators/categoryValidators');

// Create category (admin only)
router.post('/', authenticationMiddleware, getMe, isAdmin, validateBody(createCategorySchema), createCategory);

// Get all categories (all authenticated users)
router.get('/', authenticationMiddleware, getMe, checkRole(['admin', 'shop', 'sales_agent', 'rider']), validateQuery(categoryQuerySchema), getAllCategories);

// Get single category by ID (all authenticated users)
router.get('/:id', authenticationMiddleware, getMe, checkRole(['admin', 'shop', 'sales_agent', 'rider']), validateObjectId('id'), getCategoryById);

// Update category (admin only)
router.patch('/:id', authenticationMiddleware, getMe, isAdmin, validateObjectId('id'), validateBody(updateCategorySchema), updateCategory);

// Delete category (admin only)
router.delete('/:id', authenticationMiddleware, getMe, isAdmin, validateObjectId('id'), deleteCategory);

module.exports = router;
