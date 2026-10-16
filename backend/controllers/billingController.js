import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { WebhookLog } from '../models/WebhookLog.js';
import { billingFeedService } from '../services/billingFeedService.js';
import { BillingView } from '../views/billingView.js';
import { InvoiceHtmlView } from '../views/invoiceHtmlView.js';
import { memoryStore } from '../data/seed.js';

/**
 * ==============================================================================
 * 🧾 BILLING CONTROLLER (MVC)
 * ==============================================================================
 * Manages itemized invoices, printable views, and outbound webhook billing feeds
 * using Mongoose Invoice and WebhookLog models.
 * ==============================================================================
 */
export class BillingController {
  /**
   * GET /api/v1/billing/invoices
   * Retrieves generated invoices
   */
  static async getInvoices(req, res, next) {
    try {
      const customerId = req.query.customerId || null;
      let invoices = [];

      if (mongoose.connection.readyState === 1) {
        try {
          const filter = customerId ? { customerId } : {};
          invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
        } catch {
          invoices = [];
        }
      }

      if (!invoices || invoices.length === 0) {
        invoices = Array.from(memoryStore.invoices.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (customerId) {
          invoices = invoices.filter((i) => i.customerId === customerId);
        }
      }

      return res.status(200).json({
        status: 'success',
        count: invoices.length,
        data: invoices
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/billing/invoices/:id
   * Retrieves single invoice by ID or invoice number
   */
  static async getInvoiceById(req, res, next) {
    try {
      let invoice = null;

      if (mongoose.connection.readyState === 1) {
        try {
          invoice = await Invoice.findOne({
            $or: [{ id: req.params.id }, { invoiceNumber: req.params.id }]
          }).lean();
        } catch {
          invoice = null;
        }
      }

      if (!invoice) {
        invoice = memoryStore.invoices.get(req.params.id) || null;
        if (!invoice) {
          for (const inv of memoryStore.invoices.values()) {
            if (inv.invoiceNumber === req.params.id) {
              invoice = inv;
              break;
            }
          }
        }
      }

      if (!invoice) {
        return res.status(404).json({ status: 'error', message: 'Invoice not found' });
      }

      return res.status(200).json(BillingView.formatInvoice(invoice));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/billing/invoices/generate
   * Generates finalized invoice for customer & pushes feed into billing systems
   */
  static async generateInvoice(req, res, next) {
    try {
      const { customerId } = req.body;
      if (!customerId) {
        return res.status(400).json({ status: 'error', message: 'customerId is required' });
      }

      const invoice = await billingFeedService.generateInvoiceForCustomer(customerId);
      memoryStore.invoices.set(invoice.id, invoice);

      return res.status(201).json(BillingView.formatInvoice(invoice));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/billing/invoices/:id/html
   * Returns printable executive HTML receipt template
   */
  static async renderInvoiceHtml(req, res, next) {
    try {
      let invoice = null;

      if (mongoose.connection.readyState === 1) {
        try {
          invoice = await Invoice.findOne({
            $or: [{ id: req.params.id }, { invoiceNumber: req.params.id }]
          }).lean();
        } catch {
          invoice = null;
        }
      }

      if (!invoice) {
        invoice = memoryStore.invoices.get(req.params.id);
        if (!invoice) {
          for (const inv of memoryStore.invoices.values()) {
            if (inv.invoiceNumber === req.params.id) {
              invoice = inv;
              break;
            }
          }
        }
      }

      if (!invoice) {
        return res.status(404).send('Invoice not found');
      }

      let customer = null;
      if (mongoose.connection.readyState === 1) {
        try {
          customer = await Customer.findOne({ id: invoice.customerId }).lean();
        } catch {
          customer = null;
        }
      }
      if (!customer) {
        customer = memoryStore.customers.get(invoice.customerId);
      }

      const html = InvoiceHtmlView.render(invoice, customer);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/billing/webhooks
   * Outbound webhook logs dispatched to Stripe and NetSuite
   */
  static async getWebhookLogs(req, res, next) {
    try {
      let logs = [];
      if (mongoose.connection.readyState === 1) {
        try {
          logs = await WebhookLog.find().sort({ timestamp: -1 }).limit(50).lean();
        } catch {
          logs = [];
        }
      }

      if (!logs || logs.length === 0) {
        logs = billingFeedService.getWebhookLogs();
      }

      return res.status(200).json({
        status: 'success',
        count: logs.length,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
}

export default BillingController;
