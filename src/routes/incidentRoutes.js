import express from 'express';
import {
  getIncidents,
  getIncident,
  acknowledgeIncident,
  resolveIncident,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getIncidents);
router.get('/:id', getIncident);
router.post('/:id/acknowledge', acknowledgeIncident);
router.post('/:id/resolve', resolveIncident);

export default router;