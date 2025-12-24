import express from 'express';
import {
  createUser,
  getAllUsers,
  getUser,
  updateUserRole,
  getAllMonitors,
  getAllIncidents,
  getAdminStats,
  deleteUser,
  deleteAllUsers,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"'),
];

const updateRoleValidation = [
  body('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"'),
];

// User management routes
router.post('/users', createUserValidation, validate, createUser);
router.get('/users', getAllUsers);
router.get('/users/:email', getUser);
router.post('/users/:email/role', updateRoleValidation, validate, updateUserRole);
router.delete('/users/:email', deleteUser);
router.post('/users/delete-all', deleteAllUsers);

// Monitor management routes
router.get('/monitors', getAllMonitors);

// Incident management routes
router.get('/incidents', getAllIncidents);

// Admin dashboard
router.get('/stats', getAdminStats);

export default router;


