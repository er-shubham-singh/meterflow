import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import HeaderBar from '../../components/HeaderBar';

const API_TEMPLATES = {
  OpenAI: {
    method: 'POST',
    endpoint: '/v1/chat/completions',
    body: {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Explain meter-based showback billing.' }],
      max_tokens: 250,
    },
  },
  'Google Gemini': {
    method: 'POST',
    endpoint: '/v1/models/gemini-pro:generateContent',
    body: {
      contents: [{ parts: [{ text: 'Summarize real-time telemetry streaming.' }] }],
    },
  },
  Brevo: {
    method: 'POST',
    endpoint: '/v3/smtp/email',
    body: {
      sender: { name: 'MeterFlow Mobile', email: 'ops@meterflow.co.in' },
      to: [{ email: 'client@abctech.com', name: 'ABC Technologies' }],
      subject: 'Daily Ingestion Ledger Confirmation',
      htmlContent: '<p>Consumption telemetry successfully logged.</p>',
    },
  },
  Twilio: {
    method: 'POST',
    endpoint: '/2010-04-01/Accounts/AC12345/Messages.json',
    body: {
      To: '+919876543210',
      From: '+12025550199',
      Body: 'MeterFlow OTP: 819201. Active for 10 minutes.',
    },
  },
  Razorpay: {
    method: 'POST',
    endpoint: '/v1/orders',
    body: {
      amount: 45000,
      currency: 'INR',
      receipt: 'rcpt_mobile_001',
      notes: { employee: 'Vikash Yadav' },
    },
  },
};

export default function PlaygroundScreen() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState('OpenAI');
  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('/v1/chat/completions');
  const [bodyText, setBodyText] = useState(
    JSON.stringify(API_TEMPLATES.OpenAI.body, null, 2)
  );

  const [executing, setExecuting] = useState(false);
  const [response, setResponse] = useState({
    status: 200,
    statusText: 'OK',
    latency: '112ms',
    cost: '₹0.057',
    tokens: 64,
    data: {
      id: 'chatcmpl-9b81f',
      model: 'gpt-4o-mini',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Meter-based showback billing allows organizations to attribute API and cloud costs directly to the departments or individual developers generating the requests.',
          },
        },
      ],
      meterflow_meta: {
        provider: 'OpenAI',
        rate_applied: '₹0.00089 / 1k tokens',
        status: 'metered_and_logged',
      },
    },
  });

  const selectTemplate = (providerName) => {
    setSelectedProvider(providerName);
    const tmpl = API_TEMPLATES[providerName];
    if (tmpl) {
      setMethod(tmpl.method);
      setEndpoint(tmpl.endpoint);
      setBodyText(JSON.stringify(tmpl.body, null, 2));
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    const startTime = Date.now();

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        addToast('Invalid JSON in Request Body', 'warning');
        setExecuting(false);
        return;
      }

      const res = await api.sendGatewayProxy({
        apiKey: user?.apiKey || 'sk_mf_live_vikash_3311defa7890',
        provider: selectedProvider.toLowerCase().split(' ')[0],
        method,
        endpoint,
        body: parsedBody,
      });

      const elapsed = Date.now() - startTime;
      const telemetry = res?.data?.meterflow_telemetry || res?.meterflow_telemetry;
      const tokensDeducted = telemetry?.tokensUsedThisCall || res.tokens || 58;

      setResponse({
        status: 200,
        statusText: 'OK',
        latency: `${elapsed}ms`,
        cost: telemetry?.costInr ? `₹${telemetry.costInr}` : (res.cost || '₹0.045'),
        tokens: tokensDeducted,
        data: res.data || res,
      });

      if (refreshUser) refreshUser();

      const remainingText = telemetry?.tokensRemaining ? ` (${telemetry.tokensRemaining.toLocaleString()} remaining)` : '';
      addToast(`⚡ Dispatched! -${tokensDeducted} tokens deducted${remainingText}`, 'success');
    } catch (err) {
      const elapsed = Date.now() - startTime;
      setResponse({
        status: 500,
        statusText: 'Gateway Error',
        latency: `${elapsed}ms`,
        cost: '₹0.000',
        tokens: 0,
        data: { error: err.message || 'Execution error' },
      });
      addToast(err.message || 'Request failed', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="API Playground" 
        subtitle="Live Gateway" 
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Provider Chips Horizontal Bar */}
        <View style={styles.providerScrollBox}>
          <Text style={styles.sectionHeading}>Select API Provider:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providersRow}>
            {Object.keys(API_TEMPLATES).map((prov) => {
              const active = selectedProvider === prov;
              return (
                <Pressable
                  key={prov}
                  style={[styles.providerChip, active && styles.providerChipActive]}
                  onPress={() => selectTemplate(prov)}
                >
                  <Ionicons 
                    name="cloud-outline" 
                    size={14} 
                    color={active ? COLORS.primaryLight : COLORS.textMuted} 
                  />
                  <Text style={[styles.providerChipText, active && styles.providerChipTextActive]}>
                    {prov}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Method & Endpoint Input */}
        <View style={styles.card}>
          <View style={styles.endpointRow}>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{method}</Text>
            </View>
            <TextInput
              style={styles.endpointInput}
              value={endpoint}
              onChangeText={setEndpoint}
              placeholder="/v1/endpoint"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
          </View>

          {/* Request Body Editor */}
          <Text style={styles.inputLabel}>JSON Payload (Body)</Text>
          <View style={styles.bodyInputBox}>
            <TextInput
              style={styles.bodyTextInput}
              value={bodyText}
              onChangeText={setBodyText}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              textAlignVertical="top"
            />
          </View>

          {/* Run Button */}
          <Pressable
            style={({ pressed }) => [
              styles.executeBtn, 
              executing && styles.btnDisabled, 
              pressed && styles.pressed
            ]}
            onPress={handleExecute}
            disabled={executing}
          >
            <Ionicons name="flash" size={16} color={COLORS.white} />
            <Text style={styles.executeBtnText}>
              {executing ? 'Executing Through Proxy...' : '⚡ Send Live Request'}
            </Text>
          </Pressable>
        </View>

        {/* Response Console */}
        <View style={styles.responseCard}>
          <View style={styles.responseHeader}>
            <View style={styles.resTitleRow}>
              <Ionicons name="terminal" size={16} color={COLORS.primaryLight} />
              <Text style={styles.resTitle}>Gateway Response</Text>
            </View>
            <View style={[styles.statusBadge, response.status === 200 ? styles.statusSuccess : styles.statusError]}>
              <Text style={styles.statusBadgeText}>{response.status} {response.statusText}</Text>
            </View>
          </View>

          {/* Telemetry Stats Bar */}
          <View style={styles.telemetryBar}>
            <View style={styles.telemetryStat}>
              <Text style={styles.telemetryStatLabel}>Latency</Text>
              <Text style={styles.telemetryStatVal}>{response.latency}</Text>
            </View>
            <View style={styles.telemetryStat}>
              <Text style={styles.telemetryStatLabel}>Metered Cost</Text>
              <Text style={[styles.telemetryStatVal, { color: COLORS.accent }]}>{response.cost}</Text>
            </View>
            <View style={styles.telemetryStat}>
              <Text style={styles.telemetryStatLabel}>Tokens</Text>
              <Text style={styles.telemetryStatVal}>{response.tokens}</Text>
            </View>
          </View>

          {/* JSON Tree View */}
          <View style={styles.jsonBox}>
            <Text style={styles.jsonText}>{JSON.stringify(response.data, null, 2)}</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  providerScrollBox: {
    gap: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  providersRow: {
    gap: 8,
    paddingVertical: 2,
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerChipActive: {
    backgroundColor: `${COLORS.primary}25`,
    borderColor: COLORS.primary,
  },
  providerChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  providerChipTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  methodBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 11,
  },
  endpointInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  bodyInputBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    height: 140,
  },
  bodyTextInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  executeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.success,
    height: 44,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  executeBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  responseCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  resTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: `${COLORS.success}20`,
    borderColor: `${COLORS.success}40`,
  },
  statusError: {
    backgroundColor: `${COLORS.danger}20`,
    borderColor: `${COLORS.danger}40`,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },
  telemetryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  telemetryStat: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  telemetryStatVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  jsonBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 240,
  },
  jsonText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});
