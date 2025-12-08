const express = require('express');
const router = express.Router();

const { createCategory } = require('../controllers/categories/create');
const { getAllCategories } = require('../controllers/categories/getAll');
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { isAdmin, checkRole } = require('../middleware/rbac/checkRole');
const { validateBody, validateQuery } = require('../middleware/validation/validateRequest');
const { createCategorySchema, categoryQuerySchema } = require('../validators/categoryValidators');

router.post('/', authenticationMiddleware, getMe, isAdmin, validateBody(createCategorySchema), createCategory);
router.get('/', authenticationMiddleware, getMe, checkRole(['admin', 'shop', 'sales_agent', 'rider']), validateQuery(categoryQuerySchema), getAllCategories);

module.exports = router;
