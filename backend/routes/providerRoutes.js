import express from 'express';
import { providerController } from '../controllers/providerController.js';

const router = express.Router();

router.get('/', providerController.listProviders);

export default router;
