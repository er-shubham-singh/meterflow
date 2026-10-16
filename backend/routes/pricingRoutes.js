import { Router } from 'express';
import { PricingController } from '../controllers/pricingController.js';

const router = Router();

router.get('/', PricingController.getAll);
router.post('/', PricingController.create);
router.get('/:id', PricingController.getById);
router.post('/simulate', PricingController.simulateRateCard);

export default router;
