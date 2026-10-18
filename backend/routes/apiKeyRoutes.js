import express from 'express';
import { apiKeyController } from '../controllers/apiKeyController.js';

const router = express.Router();

router.get('/', apiKeyController.listApiKeys);
router.post('/', apiKeyController.createApiKey);
router.post('/:id/revoke', apiKeyController.revokeApiKey);
router.get('/employee-dashboard', apiKeyController.getEmployeeDashboard);

export default router;
