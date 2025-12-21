import express from 'express';
import {
  createMonitor,
  getMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  deleteAllMonitors,
  toggleMonitor,
} from '../controllers/monitorController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

const router = express.Router();

const monitorValidation = [
  body('name').trim().notEmpty().withMessage('Monitor name is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']).withMessage('Invalid HTTP method'),
  body('interval').optional().isInt({ min: 1 }).withMessage('Interval must be at least 1 minute'),
  body('timeout').optional().isInt({ min: 5, max: 120 }).withMessage('Timeout must be between 5 and 120 seconds'),
  body('expectedStatusCode').optional().isInt({ min: 100, max: 599 }).withMessage('Invalid status code'),
];

router.use(protect);

router.route('/')
  .get(getMonitors)
  .post(monitorValidation, validate, createMonitor);

router.post('/delete-all', deleteAllMonitors);

router.route('/:id')
  .get(getMonitor)
  .post(monitorValidation, validate, updateMonitor)
  .delete(deleteMonitor);

router.post('/:id/toggle', toggleMonitor);

export default router;