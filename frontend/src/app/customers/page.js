'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import CustomerCard from '@/components/customers/CustomerCard';
import CustomerDetailModal from '@/components/customers/CustomerDetailModal';
import Pagination from '@/components/common/Pagination';
import { api } from '@/services/api';
import { Users, Plus, UserPlus, Search } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', company: '', email: '', budgetLimit: 10000 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadCustomers = useCallback(async (targetPage = page, search = searchQuery) => {
    try {
      const res = await api.getCustomers(targetPage, limit, search);
      if (res && res.data) {
        setCustomers(res.data);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.data.length,
            totalPages: res.pagination.totalPages ?? 1,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? limit
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    loadCustomers(page, searchQuery);
    const interval = setInterval(() => {
      loadCustomers(page, searchQuery);
    }, 4000);
    return () => clearInterval(interval);
  }, [page, searchQuery, loadCustomers]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadCustomers(newPage, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setPage(1);
    loadCustomers(1, val);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setShowAddModal(false);
      setNewCust({ name: '', company: '', email: '', budgetLimit: 10000 });
      loadCustomers(1, searchQuery);
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    }
  };

  const handleGenerateInvoice = async (customerId) => {
    try {
      await api.generateInvoice(customerId);
      alert('Invoice generated and synced to billing feed!');
      loadCustomers(page, searchQuery);
    } catch (err) {
      alert('Error generating invoice: ' + err.message);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Customer Accounts & Usage Accrual"
        subtitle="Live tracking of multi-tenant consumption, budget utilization, and on-demand invoicing"
        onRefresh={() => loadCustomers(page, searchQuery)}
      />

      <main className="page-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-heading)]">
              Active Billable Tenants ({pagination.total || customers.length})
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Real-time calculations automatically updated as events arrive.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-xs text-[var(--text-heading)] placeholder:text-[var(--text-subtle)] outline-none w-44 sm:w-56 transition-all"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-3.5 rounded-lg cursor-pointer flex items-center gap-2 text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <UserPlus size={16} />
              <span>Add Tenant</span>
            </button>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onSelect={(cust) => setSelectedCustomer(cust)}
              onGenerateInvoice={handleGenerateInvoice}
            />
          ))}
        </div>

        {/* Pagination Component */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Customer Detail Breakdown Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onInvoiceGenerated={() => {
            loadCustomers(page, searchQuery);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-medium)] p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-extrabold text-[var(--text-heading)] mb-4">Add Customer Account</h3>
            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Contact Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Company</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
                  value={newCust.company}
                  onChange={(e) => setNewCust({ ...newCust, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Budget Limit (₹)</label>
                <input
                  required
                  type="number"
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
                  value={newCust.budgetLimit}
                  onChange={(e) => setNewCust({ ...newCust, budgetLimit: Number(e.target.value) })}
                />
              </div>
              <div className="flex justify-end gap-2.5 mt-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-hover-subtle)] border border-[var(--border-subtle)] text-[var(--text-heading)] rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
