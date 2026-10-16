'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import CustomerCard from '@/components/customers/CustomerCard';
import CustomerDetailModal from '@/components/customers/CustomerDetailModal';
import { api } from '@/services/api';
import { Users, Plus, UserPlus } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', company: '', email: '', budgetLimit: 10000 });
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await api.getCustomers();
      if (res.data) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
    const interval = setInterval(loadCustomers, 3000);
    return () => clearInterval(interval);
  }, [loadCustomers]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setShowAddModal(false);
      setNewCust({ name: '', company: '', email: '', budgetLimit: 10000 });
      loadCustomers();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  const handleGenerateInvoice = async (customerId) => {
    try {
      await api.generateInvoice(customerId);
      alert('Invoice generated and synced to billing feed!');
      loadCustomers();
    } catch (err) {
      alert('Error generating invoice: ' + err.message);
    }
  };

  return (
    <div>
      <Header
        title="Customer Accounts & Usage Accrual"
        subtitle="Live tracking of multi-tenant consumption, budget utilization, and on-demand invoicing"
        onRefresh={loadCustomers}
      />

      <main className="page-container">
        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              Active Billable Tenants ({customers.length})
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time calculations automatically updated as events arrive.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#10b981',
              color: '#022c22',
              fontWeight: '700',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <UserPlus size={16} />
            <span>Add Tenant Account</span>
          </button>
        </div>

        {/* Customer Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {customers.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onSelect={(cust) => setSelectedCustomer(cust)}
              onGenerateInvoice={handleGenerateInvoice}
            />
          ))}
        </div>
      </main>

      {/* Customer Detail Breakdown Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onInvoiceGenerated={() => {
            loadCustomers();
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', background: '#0d131f', padding: '28px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Add Customer Account</h3>
            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Contact Name</label>
                <input required type="text" style={{ width: '100%' }} value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Company</label>
                <input required type="text" style={{ width: '100%' }} value={newCust.company} onChange={(e) => setNewCust({ ...newCust, company: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</label>
                <input required type="email" style={{ width: '100%' }} value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Budget Limit ($)</label>
                <input required type="number" style={{ width: '100%' }} value={newCust.budgetLimit} onChange={(e) => setNewCust({ ...newCust, budgetLimit: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#10b981', color: '#022c22', fontWeight: '700', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
