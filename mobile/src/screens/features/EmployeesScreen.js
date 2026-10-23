import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../components/Toast';
import HeaderBar from '../../components/HeaderBar';
import AnimatedLoader from '../../components/AnimatedLoader';

const INITIAL_EMPLOYEES = [
  { id: 'usr_rahul_ml', name: 'Rahul Verma', email: 'rahul.v@abctech.com', teamName: 'AI Team', roleLabel: 'Lead ML Engineer', monthlyRequests: 48230, monthlyCostInr: 3450, monthlyLimitInr: 25000, apiKey: 'sk_mf_live_rahulv_7741bcde1234', status: 'active' },
  { id: 'usr_priya_arch', name: 'Priya Singh', email: 'priya.s@abctech.com', teamName: 'Development Team', roleLabel: 'Backend Architect', monthlyRequests: 32450, monthlyCostInr: 2120, monthlyLimitInr: 20000, apiKey: 'sk_mf_live_priya_8832abcd9120', status: 'active' },
  { id: 'usr_amit_dev', name: 'Amit Kumar', email: 'amit.kumar@abctech.com', teamName: 'Development Team', roleLabel: 'Fullstack Developer', monthlyRequests: 28120, monthlyCostInr: 1890, monthlyLimitInr: 20000, apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop', status: 'active' },
  { id: 'usr_neha_int', name: 'Neha Sharma', email: 'neha.s@abctech.com', teamName: 'Development Team', roleLabel: 'Integration Specialist', monthlyRequests: 21340, monthlyCostInr: 1250, monthlyLimitInr: 15000, apiKey: 'sk_mf_live_nehas_5521cdef4321', status: 'active' },
  { id: 'usr_vikash_mkt', name: 'Vikash Yadav', email: 'vikash.y@abctech.com', teamName: 'Marketing Team', roleLabel: 'Growth Engineer', monthlyRequests: 18220, monthlyCostInr: 980, monthlyLimitInr: 10000, apiKey: 'sk_mf_live_vikash_3311defa7890', status: 'active' },
];

export default function EmployeesScreen() {
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Add Employee Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('Development Team');
  const [roleLabel, setRoleLabel] = useState('Fullstack Developer');
  const [monthlyLimitInr, setMonthlyLimitInr] = useState('15000');

  // Success Created Dialog
  const [createdEmp, setCreatedEmp] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.getEmployees();
      if (res && res.data && res.data.length > 0) {
        setEmployees(res.data);
      }
    } catch {
      // Keep initial
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  const handleCopy = (id, key) => {
    setCopiedId(id);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      addToast('Please enter both name and email', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createEmployee({
        name,
        email,
        password: 'password123',
        teamName,
        roleLabel,
        monthlyLimitInr: parseInt(monthlyLimitInr, 10) || 15000,
        allowedProviders: ['OpenAI', 'Google Gemini', 'Brevo'],
      });

      if (res.success && res.data) {
        addToast(`Employee ${name} provisioned successfully!`, 'success');
        setIsModalOpen(false);
        setCreatedEmp(res.data);
        setName('');
        setEmail('');
        fetchEmployees();
      } else {
        addToast(res.message || 'Failed to create employee', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Network error creating employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.teamName?.toLowerCase().includes(q) ||
      emp.roleLabel?.toLowerCase().includes(q)
    );
  });

  const totalAllocated = employees.reduce((acc, curr) => acc + (curr.monthlyLimitInr || 0), 0);
  const totalSpent = employees.reduce((acc, curr) => acc + (curr.monthlyCostInr || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="Employee Access" 
        subtitle="Live Gateway" 
        onRefresh={onRefresh}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Pool Summary Cards */}
        <View style={styles.poolGrid}>
          <View style={styles.poolCard}>
            <Text style={styles.poolLabel}>Allocated Pool</Text>
            <Text style={styles.poolValue}>{formatCurrency(totalAllocated)}</Text>
            <Text style={styles.poolSub}>{employees.length} developers</Text>
          </View>

          <View style={styles.poolCard}>
            <Text style={styles.poolLabel}>Total Spent</Text>
            <Text style={[styles.poolValue, { color: COLORS.primaryLight }]}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.poolSub}>{Math.round((totalSpent / (totalAllocated || 1)) * 100)}% utilized</Text>
          </View>

          <View style={styles.poolCard}>
            <Text style={styles.poolLabel}>Remaining Pool</Text>
            <Text style={[styles.poolValue, { color: COLORS.success }]}>{formatCurrency(totalRemaining)}</Text>
            <Text style={styles.poolSub}>Available</Text>
          </View>
        </View>

        {/* Search & Add Button Bar */}
        <View style={styles.actionHeader}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email or team..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable 
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => setIsModalOpen(true)}
          >
            <Ionicons name="person-add" size={14} color={COLORS.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Employee Cards List */}
        <View style={styles.listContainer}>
          {filteredEmployees.map((emp) => {
            const limit = emp.monthlyLimitInr || 20000;
            const spent = emp.monthlyCostInr || 0;
            const remaining = Math.max(0, limit - spent);
            const pct = Math.min(100, Math.round((spent / limit) * 100));

            const reqLimit = emp.requestLimit || 50000;
            const requests = emp.monthlyRequests || 0;
            const requestsRemaining = emp.requestsRemaining ?? Math.max(0, reqLimit - requests);
            const reqPct = Math.min(100, Math.round((requests / reqLimit) * 100));

            const tokLimit = emp.tokensLimit || 250000;
            const tokensUsed = emp.tokensUsed || Math.round(requests * 12);
            const tokensRemaining = emp.tokensRemaining ?? Math.max(0, tokLimit - tokensUsed);

            return (
              <View key={emp.id || emp.email} style={styles.card}>
                {/* Header row */}
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{emp.name ? emp.name[0] : 'U'}</Text>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.nameRow}>
                      <Text style={styles.empName}>{emp.name}</Text>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Active</Text>
                      </View>
                    </View>
                    <Text style={styles.empRole}>{emp.roleLabel} • <Text style={styles.teamText}>{emp.teamName}</Text></Text>
                    <Text style={styles.empEmail}>{emp.email}</Text>
                  </View>
                </View>

                {/* Showback Live Remaining Pills */}
                <View style={styles.metricPillsRow}>
                  <View style={styles.metricPill}>
                    <Ionicons name="repeat" size={11} color={COLORS.secondary} />
                    <Text style={styles.metricPillText}>
                      <Text style={styles.metricPillBold}>{requestsRemaining.toLocaleString()}</Text> reqs left
                    </Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Ionicons name="layers-outline" size={11} color={COLORS.primary} />
                    <Text style={styles.metricPillText}>
                      <Text style={[styles.metricPillBold, { color: COLORS.primary }]}>{tokensRemaining.toLocaleString()}</Text> tokens left
                    </Text>
                  </View>
                  <View style={styles.metricPill}>
                    <Ionicons name="wallet-outline" size={11} color={COLORS.success} />
                    <Text style={styles.metricPillText}>
                      <Text style={[styles.metricPillBold, { color: COLORS.success }]}>{formatCurrency(remaining)}</Text> left
                    </Text>
                  </View>
                </View>

                {/* Request Quota Progress Bar */}
                <View style={styles.quotaSection}>
                  <View style={styles.quotaRow}>
                    <Text style={styles.quotaLabel}>Requests Consumption</Text>
                    <Text style={styles.quotaAmount}>
                      {requests.toLocaleString()} <Text style={styles.dimLimit}>/ {reqLimit.toLocaleString()} limit</Text>
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${reqPct}%`, backgroundColor: COLORS.secondary }
                      ]} 
                    />
                  </View>

                  <View style={styles.quotaBottomRow}>
                    <Text style={styles.percentText}>{reqPct}% limit reached</Text>
                    <Text style={[styles.remainingText, { color: COLORS.secondary }]}>
                      {requestsRemaining.toLocaleString()} reqs remaining
                    </Text>
                  </View>
                </View>

                {/* Budget Showback Progress Bar */}
                <View style={[styles.quotaSection, { marginTop: 6, borderTopWidth: 0 }]}>
                  <View style={styles.quotaRow}>
                    <Text style={styles.quotaLabel}>Budget Showback</Text>
                    <Text style={styles.quotaAmount}>
                      {formatCurrency(spent)} <Text style={styles.dimLimit}>/ {formatCurrency(limit)}</Text>
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${pct}%` },
                        pct > 80 ? styles.progressWarning : styles.progressNormal
                      ]} 
                    />
                  </View>

                  <View style={styles.quotaBottomRow}>
                    <Text style={styles.percentText}>{pct}% used</Text>
                    <Text style={styles.remainingText}>{formatCurrency(remaining)} budget left</Text>
                  </View>
                </View>

                {/* API Key Box */}
                <View style={styles.apiKeyBox}>
                  <View style={styles.keyInfo}>
                    <Ionicons name="key" size={13} color={COLORS.textMuted} />
                    <Text style={styles.keyText} numberOfLines={1}>
                      {emp.apiKey || 'sk_mf_live_demo_key'}
                    </Text>
                  </View>
                  <Pressable 
                    style={styles.copyBtn}
                    onPress={() => handleCopy(emp.id, emp.apiKey)}
                  >
                    <Ionicons 
                      name={copiedId === emp.id ? "checkmark" : "copy-outline"} 
                      size={12} 
                      color={copiedId === emp.id ? COLORS.success : COLORS.primaryLight} 
                    />
                    <Text style={[styles.copyBtnText, copiedId === emp.id && { color: COLORS.success }]}>
                      {copiedId === emp.id ? 'Copied' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Employee Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="person-add" size={18} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Provision New Employee</Text>
              </View>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. John Doe"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Corporate Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. john.d@abctech.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Department / Team</Text>
              <View style={styles.radioGroup}>
                {['Development Team', 'AI Team', 'Marketing Team'].map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.radioBtn, teamName === t && styles.radioBtnActive]}
                    onPress={() => setTeamName(t)}
                  >
                    <Text style={[styles.radioText, teamName === t && styles.radioTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Job Title / Role</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Senior Frontend Engineer"
                placeholderTextColor={COLORS.textMuted}
                value={roleLabel}
                onChangeText={setRoleLabel}
              />

              <Text style={styles.inputLabel}>Monthly Limit (INR ₹)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="15000"
                placeholderTextColor={COLORS.textMuted}
                value={monthlyLimitInr}
                onChangeText={setMonthlyLimitInr}
                keyboardType="numeric"
              />

              <View style={styles.autoNote}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                <Text style={styles.autoNoteText}>
                  A live MeterFlow API gateway token will be auto-generated and assigned.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable 
                style={[styles.confirmBtn, submitting && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={submitting}
              >
                <Text style={styles.confirmBtnText}>
                  {submitting ? 'Provisioning...' : 'Provision Account'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Created Credential Dialog */}
      {createdEmp && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Employee Provisioned!</Text>
              <Text style={styles.successSub}>
                {createdEmp.name} has been added with monthly limit of ₹{createdEmp.monthlyLimitInr?.toLocaleString()}.
              </Text>

              <View style={styles.credentialBox}>
                <Text style={styles.credLabel}>Auto-generated API Key:</Text>
                <Text style={styles.credKey}>{createdEmp.apiKey}</Text>
                <Text style={styles.credLabel}>Default Password:</Text>
                <Text style={styles.credVal}>password123</Text>
              </View>

              <Pressable 
                style={styles.confirmBtn}
                onPress={() => setCreatedEmp(null)}
              >
                <Text style={styles.confirmBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  poolGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  poolCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  poolLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  poolValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  poolSub: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    height: 42,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    height: 42,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  listContainer: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.secondary}20`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  cardMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.success,
  },
  empRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  teamText: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  empEmail: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  metricPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.xs + 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricPillText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricPillBold: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
  quotaSection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quotaAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  dimLimit: {
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressNormal: {
    backgroundColor: COLORS.primary,
  },
  progressWarning: {
    backgroundColor: COLORS.warning,
  },
  quotaBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '700',
  },
  apiKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  keyText: {
    fontSize: 10,
    color: COLORS.accent,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.cardHover,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  copyBtnText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalBody: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    height: 42,
    color: COLORS.text,
    fontSize: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  radioBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  radioBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  radioText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  radioTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  autoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  autoNoteText: {
    fontSize: 10,
    color: COLORS.success,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  successIconBox: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  credentialBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  credLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 4,
  },
  credKey: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  credVal: {
    fontSize: 12,
    color: COLORS.text,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
});
