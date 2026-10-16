import { Router } from 'express';
import { BillingController } from '../controllers/billingController.js';

const router = Router();

router.get('/invoices', BillingController.getInvoices);
router.post('/invoices/generate', BillingController.generateInvoice);
router.get('/invoices/:id', BillingController.getInvoiceById);
router.get('/invoices/:id/html', BillingController.renderInvoiceHtml);
router.get('/webhooks', BillingController.getWebhookLogs);

export default router;
