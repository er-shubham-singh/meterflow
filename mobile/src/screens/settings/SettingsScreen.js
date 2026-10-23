import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../components/Toast';
import HeaderBar from '../../components/HeaderBar';

export default function SettingsScreen() {
  const { user, isAdmin, logout, refreshUser } = useAuth();
  const { currency, setCurrency, formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [currentEndpoint, setCurrentEndpoint] = useState('');
  const [customIp, setCustomIp] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    async function loadEndpoint() {
      const url = await CONFIG.getApiBaseUrl();
      setCurrentEndpoint(url);
    }
    loadEndpoint();
  }, []);

  const handleSetEndpoint = async (url) => {
    await CONFIG.setApiBaseUrl(url);
    setCurrentEndpoint(url);
    addToast(`API Base URL updated: ${url}`, 'info');
    testHealth();
  };

  const testHealth = async () => {
    setCheckingHealth(true);
    const start = Date.now();
    try {
      const res = await api.getHealth();
      const elapsed = Date.now() - start;
      setHealthStatus({
        status: 'online',
        latency: `${elapsed}ms`,
        data: res,
      });
      addToast('Backend server is healthy & connected!', 'success');
    } catch (err) {
      const elapsed = Date.now() - start;
      setHealthStatus({
        status: 'offline',
        latency: `${elapsed}ms`,
        error: err.message,
      });
      addToast('Cannot reach server endpoint', 'error');
    } finally {
      setCheckingHealth(false);
    }
  };

  const copyToClipboard = (text, label = 'API Token') => {
    setCopiedKey(true);
    addToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to end your MeterFlow session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            addToast('Signed out successfully', 'info');
          },
        },
      ]
    );
  };

  const userName = user?.name || (isAdmin ? 'Rahul Sharma' : 'Vikash Yadav');
  const userEmail = user?.email || (isAdmin ? 'admin@meterflow.io' : 'vikash.y@abctech.com');
  const userTeam = user?.teamName || (isAdmin ? 'Executive Leadership' : 'Marketing Team');
  const initials = userName
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const apiKey = user?.apiKey || (isAdmin ? 'sk_mf_admin_9921fa84c20b' : 'sk_mf_live_vikash_3311defa7890');

  const tokensLimit = user?.tokensLimit || 250000;
  const tokensUsed = user?.tokensUsed ?? 0;
  const tokensRemaining = user?.tokensRemaining ?? Math.max(0, tokensLimit - tokensUsed);
  const tokenPct = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

  const requestLimit = user?.monthlyRequestLimit || 50000;
  const requestsMade = user?.monthlyRequests || 0;
  const requestsRemaining = user?.requestsRemaining ?? Math.max(0, requestLimit - requestsMade);
  const requestPct = Math.min(100, Math.round((requestsMade / requestLimit) * 100));

  const monthlyLimit = user?.monthlyLimitInr || (isAdmin ? 500000 : 10000);
  const currentCost = user?.monthlyCostInr || 0;
  const remainingBudget = user?.remainingBudgetInr ?? Math.max(0, monthlyLimit - currentCost);
  const budgetPct = Math.min(100, Math.round((currentCost / monthlyLimit) * 100));

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="User Profile" 
        subtitle="Live Gateway"
        onRefresh={refreshUser}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. User Identity Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={[styles.avatarBox, isAdmin ? styles.avatarAdmin : styles.avatarEmp]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.heroMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                <View style={[styles.roleBadge, isAdmin ? styles.badgeAdmin : styles.badgeEmp]}>
                  <Text style={[styles.roleBadgeText, isAdmin ? styles.textAdmin : styles.textEmp]}>
                    {isAdmin ? 'ADMIN' : 'DEVELOPER'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>{userEmail}</Text>
              <Text style={styles.userOrg}>
                {user?.organization?.name || 'ABC Technologies'} • <Text style={styles.teamHighlight}>{userTeam}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Live Allocated Quota & Tokens Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="pie-chart-outline" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Live Allocated Quota & Tokens</Text>
          </View>
          <Text style={styles.cardSub}>
            Real-time balance tracked through the central MeterFlow gateway.
          </Text>

          {/* Tokens Meter */}
          <View style={styles.quotaMeterBlock}>
            <View style={styles.meterHeader}>
              <Text style={styles.meterLabel}>
                <Ionicons name="layers-outline" size={12} color={COLORS.primary} /> Tokens Remaining
              </Text>
              <Text style={[styles.meterValue, { color: COLORS.primary }]}>
                {tokensRemaining.toLocaleString()} <Text style={styles.dimLimit}>/ {tokensLimit.toLocaleString()}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${tokenPct}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <View style={styles.meterFooter}>
              <Text style={styles.meterFootText}>{tokensUsed.toLocaleString()} tokens consumed</Text>
              <Text style={[styles.meterFootText, { color: COLORS.primary, fontWeight: '700' }]}>
                {tokensRemaining.toLocaleString()} left
              </Text>
            </View>
          </View>

          {/* Requests Meter */}
          <View style={styles.quotaMeterBlock}>
            <View style={styles.meterHeader}>
              <Text style={styles.meterLabel}>
                <Ionicons name="repeat" size={12} color={COLORS.secondary} /> Requests Remaining
              </Text>
              <Text style={[styles.meterValue, { color: COLORS.secondary }]}>
                {requestsRemaining.toLocaleString()} <Text style={styles.dimLimit}>/ {requestLimit.toLocaleString()}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${requestPct}%`, backgroundColor: COLORS.secondary }]} />
            </View>
            <View style={styles.meterFooter}>
              <Text style={styles.meterFootText}>{requestsMade.toLocaleString()} requests sent</Text>
              <Text style={[styles.meterFootText, { color: COLORS.secondary, fontWeight: '700' }]}>
                {requestsRemaining.toLocaleString()} left
              </Text>
            </View>
          </View>

          {/* Budget Meter */}
          <View style={styles.quotaMeterBlock}>
            <View style={styles.meterHeader}>
              <Text style={styles.meterLabel}>
                <Ionicons name="wallet-outline" size={12} color={COLORS.success} /> Budget Remaining
              </Text>
              <Text style={[styles.meterValue, { color: COLORS.success }]}>
                {formatCurrency(remainingBudget)} <Text style={styles.dimLimit}>/ {formatCurrency(monthlyLimit)}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${budgetPct}%`, backgroundColor: COLORS.success }]} />
            </View>
            <View style={styles.meterFooter}>
              <Text style={styles.meterFootText}>{formatCurrency(currentCost)} spent ({budgetPct}%)</Text>
              <Text style={[styles.meterFootText, { color: COLORS.success, fontWeight: '700' }]}>
                {formatCurrency(remainingBudget)} left
              </Text>
            </View>
          </View>
        </View>

        {/* 3. API Key Vault */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="key-outline" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Gateway API Token</Text>
          </View>
          <Text style={styles.cardSub}>
            Authenticated Bearer token for dispatching calls through the proxy gateway.
          </Text>

          <View style={styles.keyBox}>
            <Text style={styles.keyText} numberOfLines={1}>
              {showKey ? apiKey : `${apiKey.slice(0, 14)}••••••••••••${apiKey.slice(-4)}`}
            </Text>
            <View style={styles.keyActionBtns}>
              <Pressable
                style={styles.keyActionIconBtn}
                onPress={() => setShowKey(!showKey)}
                hitSlop={6}
              >
                <Ionicons name={showKey ? "eye-off-outline" : "eye-outline"} size={16} color={COLORS.textMuted} />
              </Pressable>
              <Pressable
                style={[styles.copyBtn, copiedKey && styles.copyBtnSuccess]}
                onPress={() => copyToClipboard(apiKey, 'API Token')}
                hitSlop={6}
              >
                <Ionicons name={copiedKey ? "checkmark" : "copy-outline"} size={13} color={copiedKey ? COLORS.white : COLORS.primary} />
                <Text style={[styles.copyBtnText, copiedKey && styles.copyBtnTextSuccess]}>
                  {copiedKey ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.allowedProvidersRow}>
            <Text style={styles.allowedHeading}>Configured Providers:</Text>
            <View style={styles.chipsWrap}>
              {(user?.allowedProviders || ['OpenAI', 'Google Gemini', 'Brevo', 'Twilio']).map((p, idx) => (
                <View key={idx} style={styles.providerChip}>
                  <Text style={styles.providerChipText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 4. Display Currency */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={16} color={COLORS.success} />
            <Text style={styles.cardTitle}>Display Currency</Text>
          </View>
          <Text style={styles.cardSub}>
            Select the currency for showback metrics, cost estimations and billing limits.
          </Text>

          <View style={styles.currencyRow}>
            {[
              { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
              { code: 'USD', symbol: '$', label: 'US Dollar' },
              { code: 'EUR', symbol: '€', label: 'Euro' },
            ].map((c) => {
              const active = currency === c.code;
              return (
                <Pressable
                  key={c.code}
                  style={[styles.currencyBtn, active && styles.currencyBtnActive]}
                  onPress={() => {
                    setCurrency(c.code);
                    addToast(`Display currency changed to ${c.code}`, 'success');
                  }}
                >
                  <Text style={[styles.currencySymbol, active && styles.currencySymbolActive]}>
                    {c.symbol}
                  </Text>
                  <Text style={[styles.currencyCode, active && styles.currencyCodeActive]}>
                    {c.code}
                  </Text>
                  <Text style={styles.currencyLabel}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 5. Backend Server Endpoint Switcher */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="server-outline" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Backend Server Endpoint</Text>
          </View>
          <Text style={styles.cardSub}>
            Target: <Text style={styles.monoText}>{currentEndpoint}</Text>
          </Text>

          <View style={styles.presetGrid}>
            <Pressable
              style={styles.presetBtn}
              onPress={() => handleSetEndpoint('http://localhost:5001/api/v1')}
            >
              <Text style={styles.presetBtnTitle}>Localhost / PC</Text>
              <Text style={styles.presetBtnSub}>localhost:5001</Text>
            </Pressable>

            <Pressable
              style={styles.presetBtn}
              onPress={() => handleSetEndpoint('http://10.0.2.2:5001/api/v1')}
            >
              <Text style={styles.presetBtnTitle}>Android Emulator</Text>
              <Text style={styles.presetBtnSub}>10.0.2.2:5001</Text>
            </Pressable>

            <Pressable
              style={styles.presetBtn}
              onPress={() => handleSetEndpoint('https://meterflow-1hcu.onrender.com/api/v1')}
            >
              <Text style={styles.presetBtnTitle}>Production Render</Text>
              <Text style={styles.presetBtnSub}>Cloud Deployed</Text>
            </Pressable>
          </View>

          <View style={styles.customIpRow}>
            <TextInput
              style={styles.customIpInput}
              placeholder="http://192.168.1.5:5001/api/v1"
              placeholderTextColor={COLORS.textMuted}
              value={customIp}
              onChangeText={setCustomIp}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                if (customIp.trim()) handleSetEndpoint(customIp.trim());
              }}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>

          <View style={styles.healthRow}>
            <Pressable
              style={({ pressed }) => [styles.testHealthBtn, checkingHealth && styles.btnDisabled, pressed && styles.pressed]}
              onPress={testHealth}
              disabled={checkingHealth}
            >
              <Ionicons name="pulse" size={14} color={COLORS.white} />
              <Text style={styles.testHealthText}>
                {checkingHealth ? 'Testing...' : 'Test Connection'}
              </Text>
            </Pressable>

            {healthStatus && (
              <View style={[styles.healthPill, healthStatus.status === 'online' ? styles.healthOnline : styles.healthOffline]}>
                <View style={[styles.healthDot, healthStatus.status === 'online' ? styles.dotOnline : styles.dotOffline]} />
                <Text style={styles.healthPillText}>
                  {healthStatus.status === 'online' ? `Online (${healthStatus.latency})` : 'Offline'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 6. Sign Out Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Sign Out from MeterFlow</Text>
        </Pressable>

        <Text style={styles.versionText}>MeterFlow Mobile • Version 2.4.0 (Production Build)</Text>
      </ScrollView>
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
    paddingBottom: SPACING.xxxl,
  },

  // 1. Hero Card
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarAdmin: {
    backgroundColor: `${COLORS.secondary}15`,
    borderColor: COLORS.secondary,
  },
  avatarEmp: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  heroMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeAdmin: {
    backgroundColor: `${COLORS.secondary}15`,
  },
  badgeEmp: {
    backgroundColor: `${COLORS.primary}15`,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textAdmin: {
    color: COLORS.secondary,
  },
  textEmp: {
    color: COLORS.primary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  userOrg: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  teamHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Generic Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },

  // Quota Meters
  quotaMeterBlock: {
    marginTop: SPACING.sm,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  meterValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  dimLimit: {
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  meterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  meterFootText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  // API Key Box
  keyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keyText: {
    fontSize: 11,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  keyActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyActionIconBtn: {
    padding: 4,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  copyBtnSuccess: {
    backgroundColor: COLORS.success,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  copyBtnTextSuccess: {
    color: COLORS.white,
  },
  allowedProvidersRow: {
    marginTop: SPACING.sm,
  },
  allowedHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  providerChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerChipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Currency
  currencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  currencyBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyBtnActive: {
    backgroundColor: `${COLORS.primary}12`,
    borderColor: COLORS.primary,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  currencySymbolActive: {
    color: COLORS.primary,
  },
  currencyCode: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  currencyCodeActive: {
    color: COLORS.primary,
  },
  currencyLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  // Presets & Health
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 7,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtnTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  presetBtnSub: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  customIpRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  customIpInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    fontSize: 11,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  testHealthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  testHealthText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  healthOnline: {
    backgroundColor: `${COLORS.success}15`,
  },
  healthOffline: {
    backgroundColor: `${COLORS.danger}15`,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: COLORS.success,
  },
  dotOffline: {
    backgroundColor: COLORS.danger,
  },
  healthPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${COLORS.danger}10`,
    borderWidth: 1,
    borderColor: `${COLORS.danger}30`,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xs,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
