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
      const page = req.query.page ? Math.max(1, Number(req.query.page)) : null;
      const limit = req.query.limit ? Math.min(Math.max(1, Number(req.query.limit)), 100) : null;
      const customerId = req.query.customerId || null;
      let invoices = [];
      let total = 0;

      const filter = customerId ? { customerId } : {};

      if (mongoose.connection.readyState === 1) {
        try {
          total = await Invoice.countDocuments(filter);
          if (page && limit) {
            invoices = await Invoice.find(filter)
              .sort({ createdAt: -1 })
              .skip((page - 1) * limit)
              .limit(limit)
              .lean();
          } else {
            invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
          }
        } catch {
          invoices = [];
        }
      }

      if (!invoices || invoices.length === 0) {
        let allInvoices = Array.from(memoryStore.invoices.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (customerId) {
          allInvoices = allInvoices.filter((i) => i.customerId === customerId);
        }
        total = allInvoices.length;
        if (page && limit) {
          invoices = allInvoices.slice((page - 1) * limit, (page - 1) * limit + limit);
        } else {
          invoices = allInvoices;
        }
      }

      const pagination = (page && limit)
        ? { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
        : { page: 1, limit: total, total, totalPages: 1 };

      return res.status(200).json({
        status: 'success',
        count: invoices.length,
        data: invoices,
        pagination
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
      const page = req.query.page ? Math.max(1, Number(req.query.page)) : null;
      const limit = req.query.limit ? Math.min(Math.max(1, Number(req.query.limit)), 100) : null;
      let logs = [];
      let total = 0;

      if (mongoose.connection.readyState === 1) {
        try {
          total = await WebhookLog.countDocuments();
          if (page && limit) {
            logs = await WebhookLog.find()
              .sort({ timestamp: -1 })
              .skip((page - 1) * limit)
              .limit(limit)
              .lean();
          } else {
            logs = await WebhookLog.find().sort({ timestamp: -1 }).limit(100).lean();
          }
        } catch {
          logs = [];
        }
      }

      if (!logs || logs.length === 0) {
        const allLogs = billingFeedService.getWebhookLogs();
        total = allLogs.length;
        if (page && limit) {
          logs = allLogs.slice((page - 1) * limit, (page - 1) * limit + limit);
        } else {
          logs = allLogs;
        }
      }

      const pagination = (page && limit)
        ? { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
        : { page: 1, limit: total, total, totalPages: 1 };

      return res.status(200).json({
        status: 'success',
        count: logs.length,
        data: logs,
        pagination
      });
    } catch (err) {
      next(err);
    }
  }
}

export default BillingController;
