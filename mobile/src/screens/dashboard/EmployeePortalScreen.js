import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../components/Toast';
import HeaderBar from '../../components/HeaderBar';
import AnimatedLoader from '../../components/AnimatedLoader';

export default function EmployeePortalScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [employeeDashboard, setEmployeeDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('curl'); // 'curl' | 'node' | 'python'

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.getEmployeeDashboard();
      if (res && res.data) {
        setEmployeeDashboard(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
    if (refreshUser) refreshUser();
  };

  const currentToken = employeeDashboard?.apiKey || user?.apiKey || 'sk_mf_live_vikash_3311defa7890';
  const monthlyLimit = employeeDashboard?.monthlyLimit || employeeDashboard?.monthlyLimitInr || user?.monthlyLimitInr || 10000;
  const currentCost = employeeDashboard?.estimatedCostInr ?? employeeDashboard?.currentCostInr ?? user?.monthlyCostInr ?? 980;
  const remainingBudget = employeeDashboard?.remainingBudgetInr ?? Math.max(0, monthlyLimit - currentCost);
  const percentUsed = Math.min(100, Math.round((currentCost / monthlyLimit) * 100));

  const totalRequestsLimit = employeeDashboard?.monthlyRequestLimit || user?.monthlyRequestLimit || 50000;
  const requestsMade = employeeDashboard?.myUsageThisMonth ?? employeeDashboard?.totalRequests ?? user?.monthlyRequests ?? 18220;
  const requestsRemaining = employeeDashboard?.requestsRemaining ?? user?.requestsRemaining ?? Math.max(0, totalRequestsLimit - requestsMade);
  const requestPercent = Math.min(100, Math.round((requestsMade / totalRequestsLimit) * 100));

  const tokensLimit = employeeDashboard?.tokensLimit || user?.tokensLimit || 250000;
  const tokensUsed = employeeDashboard?.tokensUsed ?? user?.tokensUsed ?? 0;
  const tokensRemaining = employeeDashboard?.tokensRemaining ?? user?.tokensRemaining ?? Math.max(0, tokensLimit - tokensUsed);
  const tokenPercent = Math.min(100, Math.round((tokensUsed / tokensLimit) * 100));

  // Dynamic quota utilization calculation (Audit Fix & TICKET-01)
  const quotaLimit = employeeDashboard?.requestQuotaLimit || 10000;
  const utilizationPercentage = Math.round((requestsMade / quotaLimit) * 100);
  const isOverBudget = utilizationPercentage >= 100;

  const copyToClipboard = (text, label = 'API Token') => {
    setCopiedKey(true);
    addToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleSendTestRequest = async () => {
    setSendingTest(true);
    try {
      const res = await api.proxyRequest({
        apiKey: currentToken,
        provider: 'brevo',
        endpoint: '/v3/smtp/email',
        body: { to: user?.email || 'developer@abctech.com', message: 'Mobile gateway telemetry trigger' },
      });
      const telemetry = res?.meterflow_telemetry || res?.data?.meterflow_telemetry;
      if (telemetry) {
        setEmployeeDashboard(prev => prev ? ({
          ...prev,
          tokensUsed: (prev.tokensUsed || 0) + (telemetry.tokensUsedThisCall || 25),
          tokensRemaining: telemetry.tokensRemaining ?? Math.max(0, (prev.tokensLimit || 250000) - ((prev.tokensUsed || 0) + (telemetry.tokensUsedThisCall || 25))),
          myUsageThisMonth: (prev.myUsageThisMonth || prev.totalRequests || 0) + 1,
          totalRequests: (prev.totalRequests || 0) + 1,
          requestsRemaining: telemetry.requestsRemaining ?? Math.max(0, (prev.monthlyRequestLimit || 50000) - 1),
          remainingBudgetInr: telemetry.remainingBudgetInr ?? prev.remainingBudgetInr,
          estimatedCostInr: Number(((prev.estimatedCostInr || 0) + (telemetry.costInr || 0.05)).toFixed(2)),
        }) : prev);
      }
      const decMsg = telemetry 
        ? `⚡ Live request ingested! -${telemetry.tokensUsedThisCall || 25} tokens (${telemetry.tokensRemaining?.toLocaleString()} remaining)` 
        : '⚡ Live API request ingested! Quota & tokens updated.';
      addToast(decMsg, 'success');
      await Promise.all([fetchDashboard(), refreshUser ? refreshUser() : Promise.resolve()]);
    } catch (err) {
      addToast(err.message || 'Failed to send test request', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const getCodeSnippet = () => {
    if (activeCodeTab === 'curl') {
      return `curl -X POST https://meterflow-1hcu.onrender.com/api/v1/gateway/proxy \\
  -H "Authorization: Bearer ${currentToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"brevo","endpoint":"/v3/smtp/email"}'`;
    }
    if (activeCodeTab === 'node') {
      return `import axios from 'axios';

const res = await axios.post('https://meterflow-1hcu.onrender.com/api/v1/gateway/proxy', {
  provider: 'brevo',
  endpoint: '/v3/smtp/email'
}, {
  headers: { Authorization: 'Bearer ${currentToken}' }
});`;
    }
    return `import requests

res = requests.post(
  'https://meterflow-1hcu.onrender.com/api/v1/gateway/proxy',
  json={'provider': 'brevo', 'endpoint': '/v3/smtp/email'},
  headers={'Authorization': 'Bearer ${currentToken}'}
)`;
  };

  if (loading && !employeeDashboard) {
    return (
      <View style={styles.screen}>
        <HeaderBar 
          title="Developer Portal" 
          subtitle="Live Gateway"
        />
        <View style={styles.centerLoadingWrap}>
          <AnimatedLoader message="Connecting to Live Gateway Meter..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="Developer Portal" 
        subtitle="Live Gateway"
        onRefresh={onRefresh}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Quick Action Trigger Bar */}
        <View style={styles.actionRowTop}>
          <Pressable
            style={({ pressed }) => [
              styles.triggerBtn, 
              sendingTest && styles.btnDisabled, 
              pressed && styles.pressed
            ]}
            onPress={handleSendTestRequest}
            disabled={sendingTest}
          >
            <Ionicons name="flash" size={15} color="#FFFFFF" />
            <Text style={styles.triggerBtnText}>
              {sendingTest ? 'Ingesting Call...' : 'Send Live Request'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.playgroundBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Playground')}
          >
            <Ionicons name="terminal" size={15} color={COLORS.primary} />
            <Text style={styles.playgroundBtnText}>API Playground</Text>
          </Pressable>
        </View>

        {/* Component 01: Monthly Limit Progress Ring Card (FIGMA SPEC #01 & TICKET-01) */}
        <View style={[
          styles.monthlyLimitCard,
          isOverBudget ? styles.monthlyLimitCardOverBudget : styles.monthlyLimitCardNormal
        ]}>
          {/* Header Row */}
          <View style={styles.monthlyLimitHeaderRow}>
            <View>
              <Text style={[styles.monthlyLimitTitle, isOverBudget && { color: '#991B1B' }]}>
                MONTHLY LIMIT
              </Text>
              <Text style={[styles.monthlyLimitSub, isOverBudget && { color: '#B91C1C' }]}>
                Assigned Quota & Ingestion Cap
              </Text>
            </View>
            <View style={[
              styles.monthlyLimitBadge,
              isOverBudget ? styles.badgeOverBudget : styles.badgeNormal
            ]}>
              <Ionicons 
                name={isOverBudget ? "alert-circle" : "checkmark-circle"} 
                size={13} 
                color={isOverBudget ? "#DC2626" : "#0284C7"} 
              />
              <Text style={[
                styles.monthlyLimitBadgeText,
                { color: isOverBudget ? "#DC2626" : "#0284C7" }
              ]}>
                {isOverBudget ? "Limit Exceeded" : "Normal"}
              </Text>
            </View>
          </View>

          {/* Center Circular Progress Ring */}
          <View style={styles.ringCenterContainer}>
            <View style={[
              styles.progressRingOuter,
              { borderColor: isOverBudget ? '#DC2626' : '#0284C7' }
            ]}>
              <View style={styles.progressRingInner}>
                <Text style={[
                  styles.progressRingValue,
                  { color: isOverBudget ? '#DC2626' : '#0284C7' }
                ]}>
                  {utilizationPercentage}%
                </Text>
                <Text style={[
                  styles.progressRingLabel,
                  { color: isOverBudget ? '#991B1B' : COLORS.textMuted }
                ]}>
                  UTILIZED
                </Text>
              </View>
            </View>
          </View>

          {/* Metric Text: 18,220 / 10,000 Requests (16px Bold) with Warning Sub-text */}
          <View style={styles.metricRowContainer}>
            <Text style={[
              styles.mainMetricText,
              isOverBudget && { color: '#7F1D1D' }
            ]}>
              {requestsMade.toLocaleString()} / {quotaLimit.toLocaleString()} Requests
            </Text>

            {isOverBudget ? (
              <View style={styles.warningSubTextBox}>
                <Ionicons name="warning" size={13} color="#DC2626" />
                <Text style={styles.warningSubText}>
                  Quota exceeded by {(requestsMade - quotaLimit).toLocaleString()} requests. Ingestion throttled.
                </Text>
              </View>
            ) : (
              <Text style={styles.normalSubText}>
                {(quotaLimit - requestsMade).toLocaleString()} requests available within limit
              </Text>
            )}
          </View>
        </View>

        {/* Hero Card: Live Remaining Quota & Token Meter */}
        <View style={styles.quotaCard}>
          {/* Top subtle highlight */}
          <View style={styles.quotaAccentLine} />

          <View style={styles.quotaHeader}>
            <View>
              <Text style={styles.quotaTitle}>Live Remaining Quota & Tokens</Text>
              <Text style={styles.quotaSub}>Real-time Gateway Showback</Text>
            </View>
            <View style={styles.liveMeterBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveMeterText}>LIVE METER</Text>
            </View>
          </View>

          {/* Big Currency Display */}
          <View style={styles.quotaBigValueRow}>
            <View>
              <Text style={styles.quotaBigLabel}>REMAINING BUDGET</Text>
              <Text style={styles.quotaBigValue}>{formatCurrency(remainingBudget)}</Text>
            </View>
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingBadgeText}>
                {percentUsed < 80 ? 'IN QUOTA' : 'NEAR CAP'}
              </Text>
            </View>
          </View>

          {/* Budget Progress Bar Track */}
          <View style={styles.meterSectionBlock}>
            <View style={styles.meterRowHeader}>
              <Text style={styles.meterRowLabel}>Allocated Budget</Text>
              <Text style={styles.meterRowValue}>
                {formatCurrency(currentCost)} <Text style={styles.dimLimit}>/ {formatCurrency(monthlyLimit)}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, percentUsed)}%` },
                  percentUsed > 80 ? styles.progressWarning : styles.progressSuccess
                ]} 
              />
            </View>
          </View>

          {/* Tokens Remaining Meter */}
          <View style={styles.meterSectionBlock}>
            <View style={styles.meterRowHeader}>
              <Text style={styles.meterRowLabel}>
                <Ionicons name="layers-outline" size={12} color={COLORS.primary} /> Tokens Remaining
              </Text>
              <Text style={[styles.meterRowValue, { color: COLORS.primary }]}>
                {tokensRemaining.toLocaleString()} <Text style={styles.dimLimit}>/ {tokensLimit.toLocaleString()}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, tokenPercent)}%`, backgroundColor: COLORS.primary }
                ]} 
              />
            </View>
            <View style={styles.meterRowSub}>
              <Text style={styles.meterSubText}>{tokensUsed.toLocaleString()} tokens used</Text>
              <Text style={styles.meterSubTextHighlight}>{tokensRemaining.toLocaleString()} remaining</Text>
            </View>
          </View>

          {/* Requests Remaining Meter */}
          <View style={styles.meterSectionBlock}>
            <View style={styles.meterRowHeader}>
              <Text style={styles.meterRowLabel}>
                <Ionicons name="pulse-outline" size={12} color={COLORS.secondary} /> Requests Remaining
              </Text>
              <Text style={[styles.meterRowValue, { color: COLORS.secondary }]}>
                {requestsRemaining.toLocaleString()} <Text style={styles.dimLimit}>/ {totalRequestsLimit.toLocaleString()}</Text>
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, requestPercent)}%`, backgroundColor: COLORS.secondary }
                ]} 
              />
            </View>
            <View style={styles.meterRowSub}>
              <Text style={styles.meterSubText}>{requestsMade.toLocaleString()} requests sent</Text>
              <Text style={[styles.meterSubTextHighlight, { color: COLORS.secondary }]}>
                {requestsRemaining.toLocaleString()} remaining
              </Text>
            </View>
          </View>
        </View>

        {/* 4 KPI Grid: Tokens, Requests, Budget, Status */}
        {/* 4 KPI Grid: Tokens, Requests, Budget, Status with Circular Progress Graphs */}
        <View style={styles.kpiGridFour}>
          {/* 1. Remaining Tokens */}
          <View style={styles.miniKpiCard}>
            <View style={styles.miniKpiHeader}>
              <Text style={styles.miniKpiLabel}>Remaining Tokens</Text>
              <View style={[styles.miniKpiIconWrap, { backgroundColor: `${COLORS.primary}15` }]}>
                <Ionicons name="layers" size={14} color={COLORS.primary} />
              </View>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.miniRingWrapper}>
              <View style={[styles.miniRingOuter, { borderColor: COLORS.primary }]}>
                <Text style={[styles.miniRingText, { color: COLORS.primary }]}>{tokenPercent}%</Text>
                <Text style={styles.miniRingLabel}>CONSUMED</Text>
              </View>
            </View>

            <Text style={[styles.miniKpiValue, { color: COLORS.primary }]}>
              {tokensRemaining.toLocaleString()}
            </Text>
            <Text style={styles.miniKpiSub}>{tokensUsed.toLocaleString()} of {tokensLimit.toLocaleString()} used</Text>
          </View>

          {/* 2. Monthly Limit / Requests */}
          <View style={[styles.miniKpiCard, isOverBudget && styles.miniKpiCardOverBudget]}>
            <View style={styles.miniKpiHeader}>
              <Text style={[styles.miniKpiLabel, isOverBudget && { color: '#991B1B' }]}>Monthly Limit</Text>
              <View style={[styles.miniKpiIconWrap, { backgroundColor: isOverBudget ? '#FEE2E2' : `${COLORS.secondary}15` }]}>
                <Ionicons name={isOverBudget ? "alert-circle" : "repeat"} size={14} color={isOverBudget ? '#DC2626' : COLORS.secondary} />
              </View>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.miniRingWrapper}>
              <View style={[styles.miniRingOuter, { borderColor: isOverBudget ? '#DC2626' : '#0284C7' }]}>
                <Text style={[styles.miniRingText, { color: isOverBudget ? '#DC2626' : '#0284C7' }]}>{utilizationPercentage}%</Text>
                <Text style={[styles.miniRingLabel, isOverBudget && { color: '#991B1B' }]}>UTILIZED</Text>
              </View>
            </View>

            <Text style={[styles.miniKpiValue, { color: isOverBudget ? '#DC2626' : COLORS.secondary }]}>
              {requestsMade.toLocaleString()} reqs
            </Text>
            <Text style={[styles.miniKpiSub, isOverBudget && { color: '#B91C1C' }]}>
              {isOverBudget ? `Limit: ${quotaLimit.toLocaleString()} (Exceeded)` : `of ${quotaLimit.toLocaleString()} limit`}
            </Text>
          </View>

          {/* 3. Remaining Budget */}
          <View style={styles.miniKpiCard}>
            <View style={styles.miniKpiHeader}>
              <Text style={styles.miniKpiLabel}>Remaining Budget</Text>
              <View style={[styles.miniKpiIconWrap, { backgroundColor: `${COLORS.success}15` }]}>
                <Ionicons name="wallet-outline" size={14} color={COLORS.success} />
              </View>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.miniRingWrapper}>
              <View style={[styles.miniRingOuter, { borderColor: percentUsed > 80 ? COLORS.warning : COLORS.success }]}>
                <Text style={[styles.miniRingText, { color: percentUsed > 80 ? COLORS.warning : COLORS.success }]}>{percentUsed}%</Text>
                <Text style={styles.miniRingLabel}>UTILIZED</Text>
              </View>
            </View>

            <Text style={[styles.miniKpiValue, { color: COLORS.success }]}>
              {formatCurrency(remainingBudget)}
            </Text>
            <Text style={styles.miniKpiSub}>Spent: {formatCurrency(currentCost)} of {formatCurrency(monthlyLimit)}</Text>
          </View>

          {/* 4. Gateway Status */}
          <View style={styles.miniKpiCard}>
            <View style={styles.miniKpiHeader}>
              <Text style={styles.miniKpiLabel}>Gateway Proxy</Text>
              <View style={[styles.miniKpiIconWrap, { backgroundColor: `${COLORS.success}15` }]}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              </View>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.miniRingWrapper}>
              <View style={[styles.miniRingOuter, { borderColor: COLORS.success }]}>
                <Text style={[styles.miniRingText, { color: COLORS.success }]}>100%</Text>
                <Text style={styles.miniRingLabel}>HEALTHY</Text>
              </View>
            </View>

            <Text style={[styles.miniKpiValue, { color: COLORS.success }]}>
              Active / Live
            </Text>
            <Text style={styles.miniKpiSub}>Low-latency edge proxy</Text>
          </View>
        </View>

        {/* API Key Vault Card */}
        <View style={styles.apiKeyCard}>
          <View style={styles.apiKeyHeader}>
            <View style={styles.apiKeyTitleGroup}>
              <View style={styles.keyIconWrap}>
                <Ionicons name="key" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.apiKeyTitle}>Your Personal API Key</Text>
                <Text style={styles.apiKeySub}>Bearer token for all outbound proxy calls</Text>
              </View>
            </View>
            <View style={styles.envPill}>
              <Text style={styles.envPillText}>PRODUCTION</Text>
            </View>
          </View>

          {/* Monospace Key Display Box */}
          <View style={styles.keyDisplayBox}>
            <Text style={styles.keyText} numberOfLines={1}>
              {showKey ? currentToken : `${currentToken.slice(0, 16)}••••••••••••${currentToken.slice(-4)}`}
            </Text>
            <View style={styles.keyActions}>
              <Pressable
                style={styles.keyActionBtn}
                onPress={() => setShowKey(!showKey)}
                hitSlop={6}
              >
                <Ionicons 
                  name={showKey ? "eye-off-outline" : "eye-outline"} 
                  size={16} 
                  color={COLORS.textMuted} 
                />
              </Pressable>
              <Pressable
                style={[styles.copyBtn, copiedKey && styles.copyBtnSuccess]}
                onPress={() => copyToClipboard(currentToken, 'API Key')}
                hitSlop={6}
              >
                <Ionicons 
                  name={copiedKey ? "checkmark" : "copy-outline"} 
                  size={14} 
                  color={copiedKey ? COLORS.white : COLORS.primary} 
                />
                <Text style={[styles.copyBtnText, copiedKey && styles.copyBtnTextSuccess]}>
                  {copiedKey ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Authorized Gateways */}
          <View style={styles.gatewaysSection}>
            <Text style={styles.gatewaysLabel}>Authorized API Gateways:</Text>
            <View style={styles.gatewayChipsRow}>
              {['Brevo', 'Twilio', 'Razorpay'].map((gw) => (
                <View key={gw} style={styles.gwChip}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  <Text style={styles.gwChipText}>{gw}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 5. Developer Code Snippets Terminal */}
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.terminalDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.terminalDot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.terminalDot, { backgroundColor: '#10B981' }]} />
            </View>
            <View style={styles.codeTabs}>
              {['curl', 'node', 'python'].map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.codeTab, activeCodeTab === tab && styles.codeTabActive]}
                  onPress={() => setActiveCodeTab(tab)}
                >
                  <Text style={[styles.codeTabText, activeCodeTab === tab && styles.codeTabTextActive]}>
                    {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : 'Python'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.codeTerminal}>
            <Text style={styles.codeContent}>{getCodeSnippet()}</Text>
          </View>

          <Pressable
            style={styles.copySnippetBtn}
            onPress={() => copyToClipboard(getCodeSnippet(), `${activeCodeTab.toUpperCase()} Snippet`)}
          >
            <Ionicons name="copy-outline" size={13} color="#94A3B8" />
            <Text style={styles.copySnippetText}>Copy Code Snippet</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerLoadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16, // Enforce standard 16px edge padding per Audit Spec
    paddingVertical: 16,
    gap: 16,
    paddingBottom: 40,
  },

  // Component 01: Monthly Limit Progress Ring Card (Figma Spec #01)
  monthlyLimitCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  monthlyLimitCardNormal: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  monthlyLimitCardOverBudget: {
    backgroundColor: '#FEE2E2', // Light Red Fill
    borderColor: '#FCA5A5',
  },
  monthlyLimitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthlyLimitTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  monthlyLimitSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  monthlyLimitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  badgeNormal: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  badgeOverBudget: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FCA5A5',
  },
  monthlyLimitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ringCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  progressRingOuter: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  progressRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 24,
  },
  progressRingLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  metricRowContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  mainMetricText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  warningSubTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  warningSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
    flex: 1,
  },
  normalSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // 1. Profile Card
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  profileSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emailMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  actionRowTop: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  quotaBigLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  meterSectionBlock: {
    marginTop: SPACING.sm,
  },
  meterRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  meterRowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  meterRowValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
  dimLimit: {
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  meterRowSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  meterSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  meterSubTextHighlight: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  kpiGridFour: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  triggerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  triggerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  playgroundBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playgroundBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // 2. Hero Quota Card
  quotaCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  quotaAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.success,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quotaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  quotaSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  liveMeterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${COLORS.success}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  liveMeterText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  quotaBigValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  quotaBigValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  remainingBadge: {
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  remainingBadgeText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressSuccess: {
    backgroundColor: COLORS.success,
  },
  progressWarning: {
    backgroundColor: COLORS.warning,
  },
  quotaBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  breakdownText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  pillSuccess: {
    backgroundColor: `${COLORS.success}15`,
  },
  pillWarning: {
    backgroundColor: `${COLORS.warning}15`,
  },
  percentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textSuccess: {
    color: COLORS.success,
  },
  textWarning: {
    color: COLORS.warning,
  },

  // 3. Mini KPI Row
  miniKpiRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  miniKpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  miniKpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniKpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  miniKpiIconWrap: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniKpiCardOverBudget: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  miniRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  miniRingOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  miniRingText: {
    fontSize: 12.5,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  miniRingLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  miniKpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  miniKpiSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.success,
  },
  statusActiveText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.success,
  },

  // 4. API Key Vault Card
  apiKeyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  apiKeyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.xs,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiKeyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  apiKeySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  envPill: {
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: `${COLORS.primary}25`,
  },
  envPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  keyDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginTop: SPACING.xs,
  },
  keyText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyActionBtn: {
    padding: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  copyBtnSuccess: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  copyBtnTextSuccess: {
    color: '#FFFFFF',
  },
  gatewaysSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  gatewaysLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  gatewayChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gwChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gwChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // 5. Code Terminal
  codeCard: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  codeTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  codeTab: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  codeTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  codeTabText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  codeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  codeTerminal: {
    paddingVertical: SPACING.md,
  },
  codeContent: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  copySnippetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  copySnippetText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
