export class InvoiceHtmlView {
  static render(invoice, customer) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: invoice.currency || 'INR'
      }).format(amount);
    };

    const formatDate = (isoString) => {
      if (!isoString) return 'N/A';
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber} - Metering Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #090d16;
      color: #e2e8f0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .invoice-card {
      width: 100%;
      max-width: 840px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 32px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
    .badge-synced { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid #6366f1; }
    .inv-meta { text-align: right; }
    .inv-number { font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; }
    .inv-date { font-size: 13px; color: #94a3b8; }
    
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
    }
    .party-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .party-name { font-size: 16px; font-weight: 600; color: #f1f5f9; }
    .party-sub { font-size: 14px; color: #94a3b8; margin-top: 4px; line-height: 1.5; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid #334155;
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 16px;
      border-bottom: 1px solid #1e293b;
      font-size: 14px;
      color: #cbd5e1;
    }
    .item-desc { font-weight: 600; color: #f8fafc; }
    .item-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
    .tier-chip {
      display: inline-block;
      font-size: 11px;
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 4px;
      margin-top: 4px;
      color: #94a3b8;
    }

    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
    .totals-box {
      width: 320px;
      background: #1e293b;
      border-radius: 8px;
      padding: 20px;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      color: #94a3b8;
    }
    .tot-row.grand {
      font-size: 18px;
      font-weight: 700;
      color: #10b981;
      border-top: 1px solid #334155;
      padding-top: 12px;
      margin-top: 12px;
      margin-bottom: 0;
    }
    .sync-banner {
      margin-top: 40px;
      padding: 16px;
      border-radius: 8px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #c7d2fe;
    }
    .print-bar {
      margin-top: 28px;
      text-align: center;
    }
    .btn-print {
      background: #10b981;
      color: #042f2e;
      font-weight: 600;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    }
    .btn-print:hover { opacity: 0.9; }
    .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    @media screen and (max-width: 680px) {
      body { padding: 16px 10px; }
      .invoice-card { padding: 24px 16px; border-radius: 12px; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
      .inv-meta { text-align: left; }
      .parties-grid { grid-template-columns: 1fr; gap: 20px; }
      .totals-area { justify-content: stretch; }
      .totals-box { width: 100%; }
      table { min-width: 520px; }
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .invoice-card { border: none; box-shadow: none; background: white; color: black; }
      .btn-print, .print-bar { display: none; }
      th, td, .party-sub, .inv-date { color: #333; }
      .item-desc, .party-name, .inv-number { color: #000; }
      .totals-box { background: #f3f4f6; color: #000; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          METERFLOW SYSTEMS
        </div>
        <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Usage-Based Metering & Consumption Engine</p>
      </div>
      <div class="inv-meta">
        <div class="inv-number">${invoice.invoiceNumber}</div>
        <div class="inv-date">Period: ${formatDate(invoice.periodStart)} &ndash; ${formatDate(invoice.periodEnd)}</div>
        <div style="margin-top: 8px;">
          <span class="badge badge-success">${invoice.status}</span>
        </div>
      </div>
    </div>

    <div class="parties-grid">
      <div>
        <div class="party-title">Billed To</div>
        <div class="party-name">${customer ? customer.company || customer.name : invoice.customerName}</div>
        <div class="party-sub">
          Attn: ${customer ? customer.name : invoice.customerName}<br>
          Email: ${customer ? customer.email : 'billing@customer.com'}<br>
          Account ID: <code>${invoice.customerId}</code>
        </div>
      </div>
      <div>
        <div class="party-title">Issued By</div>
        <div class="party-name">MeterFlow Cloud Infrastructure (India) Pvt. Ltd.</div>
        <div class="party-sub">
          Outer Ring Road, Bellandur<br>
          Bengaluru, Karnataka 560103, India<br>
          GSTIN: 29AABCM9482F1Z4
        </div>
      </div>
    </div>

    <div class="table-responsive">
    <table>
      <thead>
        <tr>
          <th>Meter / Consumption Item</th>
          <th>Aggregation</th>
          <th style="text-align: right;">Quantity</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(invoice.lineItems || []).map(item => `
          <tr>
            <td>
              <div class="item-desc">${item.meterName}</div>
              <div class="item-sub">${item.pricingModel} rate card</div>
              ${item.tierBreakdown && item.tierBreakdown.length > 0 ? `
                <div style="margin-top: 6px;">
                  ${item.tierBreakdown.map(t => `
                    <span class="tier-chip">Tier ${t.tier}: ${t.unitsConsumed.toLocaleString()} @ ₹${t.unitPrice} = ${formatCurrency(t.cost)}</span>
                  `).join('')}
                </div>
              ` : ''}
            </td>
            <td><code>${item.aggregationType || 'SUM'}</code></td>
            <td style="text-align: right; font-weight: 600;">${(item.quantity || 0).toLocaleString()} ${item.unit || ''}</td>
            <td style="text-align: right; font-weight: 600; color: #f8fafc;">${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>

    <div class="totals-area">
      <div class="totals-box">
        <div class="tot-row">
          <span>Subtotal</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        <div class="tot-row">
          <span>Tax (0.00%)</span>
          <span>${formatCurrency(invoice.tax || 0)}</span>
        </div>
        <div class="tot-row grand">
          <span>Total Accrued</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    ${invoice.billingSystemSync ? `
      <div class="sync-banner">
        <div>
          <strong>Billing Feed Sync:</strong> Directly synchronized to <strong>${invoice.billingSystemSync.provider}</strong>
          <br><span style="font-size: 11px; opacity: 0.8;">Sync Ref: ${invoice.billingSystemSync.externalReferenceId} | Status: ${invoice.billingSystemSync.syncStatus}</span>
        </div>
        <span class="badge badge-synced">Synced</span>
      </div>
    ` : ''}

    <div class="print-bar">
      <button class="btn-print" onclick="window.print()">Print / Download PDF</button>
    </div>
  </div>
</body>
</html>`;
  }
}
