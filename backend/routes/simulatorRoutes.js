import { Router } from 'express';
import { SimulatorController } from '../controllers/simulatorController.js';

const router = Router();

router.post('/start', SimulatorController.start);
router.post('/stop', SimulatorController.stop);
router.post('/burst', SimulatorController.burst);
router.get('/status', SimulatorController.getStatus);

export default router;
