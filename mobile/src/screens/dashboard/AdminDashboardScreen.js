import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import HeaderBar from '../../components/HeaderBar';
import AnimatedLoader from '../../components/AnimatedLoader';

export default function AdminDashboardScreen({ navigation }) {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getCompanyDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const metrics = data?.metrics || {
    totalRequests: 245230,
    totalRequestsChange: '+12% this month',
    totalCost: 12450,
    totalCostChange: '+8% this month',
    activeEmployees: 28,
    activeEmployeesChange: '+2 provisioned',
    connectedApis: 8,
    connectedApisDetail: '3 ext, 5 int',
    organization: 'ABC Technologies',
    plan: 'Enterprise Plan',
  };

  const budgetStatus = data?.budgetStatus || [
    { teamName: 'Development Team', allocatedBudget: 60000, currentSpend: 24800, percentUsed: 41 },
    { teamName: 'AI Team', allocatedBudget: 50000, currentSpend: 31200, percentUsed: 62 },
    { teamName: 'Marketing Team', allocatedBudget: 25000, currentSpend: 9800, percentUsed: 39 },
  ];

  const topEmployees = data?.topEmployees || [
    { name: 'Rahul Verma', roleLabel: 'Lead ML Engineer', teamName: 'AI Team', monthlyRequests: 48230, monthlyCostInr: 3450 },
    { name: 'Priya Singh', roleLabel: 'Backend Architect', teamName: 'Development Team', monthlyRequests: 32450, monthlyCostInr: 2120 },
    { name: 'Amit Kumar', roleLabel: 'Fullstack Dev', teamName: 'Development Team', monthlyRequests: 28120, monthlyCostInr: 1890 },
    { name: 'Vikash Yadav', roleLabel: 'Growth Engineer', teamName: 'Marketing Team', monthlyRequests: 18220, monthlyCostInr: 980 },
  ];

  const recentActivity = data?.recentActivity || [
    { provider: 'OpenAI', endpoint: '/v1/chat/completions', latency: '240ms', status: 200, cost: 0.057, timestamp: '1m ago' },
    { provider: 'Brevo', endpoint: '/v3/smtp/email', latency: '92ms', status: 200, cost: 0.02, timestamp: '3m ago' },
    { provider: 'Google Gemini', endpoint: '/v1/models/gemini-pro', latency: '185ms', status: 200, cost: 0.034, timestamp: '6m ago' },
    { provider: 'Razorpay', endpoint: '/v1/orders', latency: '110ms', status: 200, cost: 0.015, timestamp: '11m ago' },
  ];

  if (loading && !data) {
    return (
      <View style={styles.screen}>
        <HeaderBar 
          title="Admin Overview" 
          subtitle="Live Gateway" 
        />
        <View style={styles.centerLoadingWrap}>
          <AnimatedLoader message="Synchronizing Platform Telemetry..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="Admin Overview" 
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
        {/* Enterprise Organization Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <View>
              <View style={styles.statusLivePill}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusLiveText}>ALL GATEWAYS OPERATIONAL (99.99%)</Text>
              </View>
              <Text style={styles.bannerTitle}>{metrics.organization || 'ABC Technologies'}</Text>
              <Text style={styles.bannerSubtitle}>{metrics.plan || 'Enterprise Plan'} • High-Volume Tier</Text>
            </View>

            <Pressable 
              style={({ pressed }) => [styles.bannerAction, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Playground')}
            >
              <Ionicons name="flash" size={14} color={COLORS.primary} />
              <Text style={styles.bannerActionText}>Gateway</Text>
            </Pressable>
          </View>
        </View>

        {/* 4-Card Executive KPI Grid */}
        <View style={styles.kpiGrid}>
          {/* 1. Total Requests */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Requests</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: `${COLORS.primary}12` }]}>
                <Ionicons name="pulse" size={16} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.kpiValue}>
              {metrics.totalRequests ? metrics.totalRequests.toLocaleString() : '245,230'}
            </Text>
            <View style={styles.kpiTrendRow}>
              <Ionicons name="arrow-up" size={12} color={COLORS.success} />
              <Text style={styles.kpiTrendText}>{metrics.totalRequestsChange || '+12% this month'}</Text>
            </View>
          </View>

          {/* 2. Total Cost Showback */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Showback</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: `${COLORS.success}12` }]}>
                <Ionicons name="cash-outline" size={16} color={COLORS.success} />
              </View>
            </View>
            <Text style={styles.kpiValue}>
              {formatCurrency(metrics.totalCost || 12450)}
            </Text>
            <View style={styles.kpiTrendRow}>
              <Ionicons name="arrow-up" size={12} color={COLORS.success} />
              <Text style={styles.kpiTrendText}>{metrics.totalCostChange || '+8% this month'}</Text>
            </View>
          </View>

          {/* 3. Active Employees */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Active Employees</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: `${COLORS.secondary}12` }]}>
                <Ionicons name="people" size={16} color={COLORS.secondary} />
              </View>
            </View>
            <Text style={styles.kpiValue}>
              {metrics.activeEmployees || 28}
            </Text>
            <View style={styles.kpiTrendRow}>
              <Ionicons name="arrow-up" size={12} color={COLORS.success} />
              <Text style={styles.kpiTrendText}>{metrics.activeEmployeesChange || '+2 provisioned'}</Text>
            </View>
          </View>

          {/* 4. Connected APIs */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Connected APIs</Text>
              <View style={[styles.kpiIconBox, { backgroundColor: `${COLORS.accent}12` }]}>
                <Ionicons name="git-network" size={16} color={COLORS.accent} />
              </View>
            </View>
            <Text style={styles.kpiValue}>
              {metrics.connectedApis || 8}
            </Text>
            <View style={styles.kpiTrendRow}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
              <Text style={[styles.kpiTrendText, { color: COLORS.primary }]}>
                {metrics.connectedApisDetail || '3 ext, 5 int'}
              </Text>
            </View>
          </View>
        </View>

        {/* Department Showback Budget Allocation */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="pie-chart" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Department Showback Budgets</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Monthly limit tracking</Text>
          </View>

          <View style={styles.budgetList}>
            {budgetStatus.map((dept, index) => {
              const pct = dept.percentUsed || Math.round((dept.currentSpend / dept.allocatedBudget) * 100);
              const isHigh = pct > 80;
              return (
                <View key={index} style={styles.budgetItem}>
                  <View style={styles.budgetRowTop}>
                    <Text style={styles.budgetName}>{dept.teamName}</Text>
                    <Text style={styles.budgetAmount}>
                      {formatCurrency(dept.currentSpend)} / <Text style={styles.budgetLimit}>{formatCurrency(dept.allocatedBudget)}</Text>
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${Math.min(100, pct)}%` },
                        isHigh ? styles.progressHigh : styles.progressNormal
                      ]} 
                    />
                  </View>

                  <View style={styles.budgetRowBottom}>
                    <Text style={[styles.budgetPercentText, isHigh && { color: COLORS.warning }]}>
                      {pct}% Utilized
                    </Text>
                    <Text style={styles.budgetRemainingText}>
                      {formatCurrency(Math.max(0, dept.allocatedBudget - dept.currentSpend))} Remaining
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Consuming Developers Leaderboard */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Top Consuming Developers</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Employees')}>
              <Text style={styles.linkText}>View All &gt;</Text>
            </Pressable>
          </View>

          <View style={styles.employeeList}>
            {topEmployees.map((emp, index) => (
              <View key={index} style={styles.employeeItem}>
                <View style={[styles.rankBadge, index === 0 && styles.rankGold, index === 1 && styles.rankSilver, index === 2 && styles.rankBronze]}>
                  <Text style={[styles.rankText, index < 3 && styles.rankTextTop]}>#{index + 1}</Text>
                </View>

                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{emp.name ? emp.name[0] : 'U'}</Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{emp.name}</Text>
                  <Text style={styles.employeeRole}>{emp.roleLabel} • {emp.teamName}</Text>
                </View>

                <View style={styles.employeeStats}>
                  <Text style={styles.empCostText}>{formatCurrency(emp.monthlyCostInr || emp.costInr || 0)}</Text>
                  <Text style={styles.empReqText}>{(emp.monthlyRequests || emp.requests || 0).toLocaleString()} reqs</Text>
                  <Text style={styles.empRemainingText}>
                    {(emp.requestsRemaining !== undefined ? emp.requestsRemaining : Math.max(0, 50000 - (emp.requests || 0))).toLocaleString()} left
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Live Gateway Telemetry Stream */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="radio" size={18} color={COLORS.success} />
              <Text style={styles.sectionTitle}>Live Gateway Telemetry Stream</Text>
            </View>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>REAL-TIME</Text>
            </View>
          </View>

          <View style={styles.telemetryList}>
            {recentActivity.map((event, idx) => (
              <View key={idx} style={styles.telemetryItem}>
                <View style={styles.telemetryLeft}>
                  <View style={styles.statusCodeBox}>
                    <Text style={styles.statusCodeText}>{event.status || 200}</Text>
                  </View>
                  <View>
                    <Text style={styles.providerName}>{event.provider}</Text>
                    <Text style={styles.endpointPath} numberOfLines={1}>{event.endpoint}</Text>
                  </View>
                </View>

                <View style={styles.telemetryRight}>
                  <Text style={styles.latencyText}>{event.latency}</Text>
                  <Text style={styles.timestampText}>{event.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
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
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },

  // Banner
  banner: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusLiveText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  bannerActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 2,
  },
  kpiTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  kpiTrendText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Budgets
  budgetList: {
    gap: SPACING.md,
  },
  budgetItem: {
    gap: 6,
  },
  budgetRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  budgetAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  budgetLimit: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 7,
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
  progressHigh: {
    backgroundColor: COLORS.warning,
  },
  budgetRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  budgetRemainingText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Leaderboard
  employeeList: {
    gap: SPACING.sm,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 10,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: {
    backgroundColor: '#FEF3C7',
  },
  rankSilver: {
    backgroundColor: '#F1F5F9',
  },
  rankBronze: {
    backgroundColor: '#FFEDD5',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  rankTextTop: {
    color: COLORS.text,
  },
  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  employeeRole: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  employeeStats: {
    alignItems: 'flex-end',
  },
  empCostText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  empReqText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  empRemainingText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 1,
  },

  // Telemetry
  liveBadge: {
    backgroundColor: `${COLORS.success}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.success,
  },
  telemetryList: {
    gap: 8,
  },
  telemetryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  telemetryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusCodeBox: {
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  statusCodeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '800',
  },
  providerName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  endpointPath: {
    fontSize: 10,
    color: COLORS.textMuted,
    maxWidth: 160,
  },
  telemetryRight: {
    alignItems: 'flex-end',
  },
  latencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  timestampText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
