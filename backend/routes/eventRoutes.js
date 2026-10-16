import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';

const router = Router();

router.post('/', EventController.ingestSingle);
router.post('/batch', EventController.ingestBatch);
router.get('/', EventController.getRecentEvents);
router.get('/stream', EventController.streamEvents);
router.get('/telemetry', EventController.getTelemetry);
router.post('/reset', EventController.resetUsage);

export default router;
