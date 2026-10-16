import { Router } from 'express';
import { CustomerController } from '../controllers/customerController.js';

const router = Router();

router.get('/', CustomerController.getAll);
router.post('/', CustomerController.create);
router.get('/:id', CustomerController.getById);
router.get('/:id/usage', CustomerController.getUsageSummary);
router.put('/:id', CustomerController.update);

export default router;
