export class BillingView {
  static formatCustomerUsage(customer, plan, usageBreakdown, totalAccrued) {
    return {
      status: 'success',
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          company: customer.company,
          email: customer.email,
          budgetLimit: customer.budgetLimit
        },
        plan: {
          id: plan.id,
          name: plan.name,
          baseFee: plan.baseFee,
          currency: plan.currency
        },
        billingPeriod: {
          start: customer.currentPeriodStart,
          currentAsOf: new Date().toISOString()
        },
        metrics: usageBreakdown,
        financialSummary: {
          baseFee: plan.baseFee,
          usageCost: Number((totalAccrued - plan.baseFee).toFixed(4)),
          totalAccrued: Number(totalAccrued.toFixed(2)),
          currency: plan.currency,
          percentOfBudget: customer.budgetLimit > 0 ? Number(((totalAccrued / customer.budgetLimit) * 100).toFixed(1)) : 0
        }
      }
    };
  }

  static formatInvoice(invoice) {
    return {
      status: 'success',
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        planName: invoice.planName,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        currency: invoice.currency,
        status: invoice.status,
        billingSystemSync: invoice.billingSystemSync,
        createdAt: invoice.createdAt
      }
    };
  }

  static formatStripeBillingFeedPayload(invoice, customer) {
    return {
      id: `evt_hook_${Date.now()}`,
      object: 'event',
      api_version: '2024-10-28',
      created: Math.floor(Date.now() / 1000),
      type: 'billing.usage_record.created',
      data: {
        object: {
          id: `mrec_${invoice.id}`,
          object: 'usage_record',
          customer: customer.id,
          subscription_item: `si_${customer.planId}`,
          livemode: true,
          quantity: Math.round(invoice.lineItems.reduce((acc, cur) => acc + (cur.quantity || 0), 0)),
          timestamp: Math.floor(new Date(invoice.periodEnd).getTime() / 1000),
          total_amount_cents: Math.round(invoice.total * 100),
          currency: invoice.currency.toLowerCase(),
          line_item_breakdown: invoice.lineItems.map(item => ({
            meter: item.meterName,
            tier_details: item.tierBreakdown,
            amount: item.amount
          }))
        }
      }
    };
  }
}
