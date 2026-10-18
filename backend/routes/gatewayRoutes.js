import express from 'express';
import { gatewayController } from '../controllers/gatewayController.js';

const router = express.Router();

router.post('/proxy', gatewayController.handleProxy);

export default router;
