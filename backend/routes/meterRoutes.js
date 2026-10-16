import { Router } from 'express';
import { MeterController } from '../controllers/meterController.js';

const router = Router();

router.get('/', MeterController.getAll);
router.post('/', MeterController.create);
router.get('/:id', MeterController.getById);
router.put('/:id', MeterController.update);
router.delete('/:id', MeterController.delete);

export default router;
