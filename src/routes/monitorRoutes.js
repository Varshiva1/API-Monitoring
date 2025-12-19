import express from 'express';
import {
  createMonitor,
  getMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  getMonitorStats,
  toggleMonitor,
} from '../controllers/monitorController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Validation rules
const createMonitorValidation = [
  body('name').trim().notEmpty().withMessage('Monitor name is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']).withMessage('Invalid HTTP method'),
  body('interval').optional().isInt({ min: 1 }).withMessage('Interval must be at least 1 minute'),
  body('timeout').optional().isInt({ min: 5, max: 120 }).withMessage('Timeout must be between 5 and 120 seconds'),
  body('expectedStatusCode').optional().isInt({ min: 100, max: 599 }).withMessage('Invalid status code'),
];

const updateMonitorValidation = [
  body('name').optional().trim().notEmpty().withMessage('Monitor name cannot be empty'),
  body('url').optional().isURL().withMessage('Valid URL is required'),
  body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']).withMessage('Invalid HTTP method'),
  body('interval').optional().isInt({ min: 1 }).withMessage('Interval must be at least 1 minute'),
  body('timeout').optional().isInt({ min: 5, max: 120 }).withMessage('Timeout must be between 5 and 120 seconds'),
];

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getMonitors)
  .post(createMonitorValidation, validate, createMonitor);

router.route('/:id')
  .get(getMonitor)
  .put(updateMonitorValidation, validate, updateMonitor)
  .delete(deleteMonitor);

router.get('/:id/stats', getMonitorStats);
router.patch('/:id/toggle', toggleMonitor);

export default router;