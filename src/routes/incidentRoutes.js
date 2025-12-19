import express from 'express';
import {
  getIncidents,
  getIncident,
  acknowledgeIncident,
  resolveIncident,
  getIncidentStats,
  getRecentIncidents,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getIncidents);
router.get('/stats', getIncidentStats);
router.get('/recent', getRecentIncidents);
router.get('/:id', getIncident);
router.put('/:id/acknowledge', acknowledgeIncident);
router.put('/:id/resolve', resolveIncident);

export default router;