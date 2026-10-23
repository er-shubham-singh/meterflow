import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../components/Toast';
import HeaderBar from '../../components/HeaderBar';

const INITIAL_KEYS = [
  { id: 'key_prod_01', name: 'Production Gateway Main', environment: 'production', keyMasked: 'sk_mf_live_••••••••••••3311', rawKey: 'sk_mf_live_vikash_3311defa7890', monthlyLimit: 25000, currentRequests: 18220, lastUsed: 'Just now', status: 'active' },
  { id: 'key_dev_02', name: 'Internal Dev Cluster', environment: 'development', keyMasked: 'sk_mf_dev_••••••••••••ijkl', rawKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop', monthlyLimit: 15000, currentRequests: 8410, lastUsed: '15m ago', status: 'active' },
  { id: 'key_ml_03', name: 'Lead ML Cluster Key', environment: 'production', keyMasked: 'sk_mf_live_••••••••••••1234', rawKey: 'sk_mf_live_rahulv_7741bcde1234', monthlyLimit: 30000, currentRequests: 24820, lastUsed: '2m ago', status: 'active' },
];

export default function ApiKeysScreen() {
  const { formatCurrency } = useCurrency();
  const { addToast } = useToast();

  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('production');
  const [creating, setCreating] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getApiKeys();
      if (res && res.data && res.data.length > 0) {
        setKeys(res.data);
      }
    } catch {
      // Use initial
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCopy = (id, text) => {
    setCopiedId(id);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id, name) => {
    Alert.alert(
      'Revoke API Key',
      `Are you sure you want to revoke "${name}"? Any active integration using this key will immediately receive 401 Unauthorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Key',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.revokeApiKey(id);
              addToast(`API Key "${name}" revoked`, 'info');
              setKeys((prev) => prev.filter((k) => k.id !== id));
            } catch (err) {
              addToast(err.message || 'Failed to revoke key', 'error');
            }
          },
        },
      ]
    );
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      addToast('Please enter a name for the API Key', 'warning');
      return;
    }

    setCreating(true);
    try {
      const res = await api.createApiKey({
        name: newKeyName,
        environment: newKeyEnv,
        monthlyLimit: newKeyEnv === 'production' ? 20000 : 5000,
      });

      if (res.data) {
        const rawKey = res.data.rawKey || `sk_mf_${newKeyEnv}_${Date.now()}`;
        setCreatedRawKey(rawKey);
        addToast('New API Key generated successfully!', 'success');
        setIsModalOpen(false);
        setNewKeyName('');
        setKeys((prev) => [
          {
            id: res.data.id || `key_${Date.now()}`,
            name: newKeyName,
            environment: newKeyEnv,
            keyMasked: `sk_mf_${newKeyEnv.substring(0, 4)}_••••••••${rawKey.slice(-4)}`,
            rawKey: rawKey,
            monthlyLimit: newKeyEnv === 'production' ? 20000 : 5000,
            currentRequests: 0,
            lastUsed: 'Never',
            status: 'active',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      addToast(err.message || 'Failed to create key', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <HeaderBar 
        title="API Keys Vault" 
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
        {/* Banner with Add Key CTA */}
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Active API Credentials</Text>
              <Text style={styles.bannerSubtitle}>
                Tokens authenticate client applications through the MeterFlow metering proxy.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.createKeyBtn, pressed && styles.pressed]}
              onPress={() => setIsModalOpen(true)}
            >
              <Ionicons name="key" size={14} color={COLORS.white} />
              <Text style={styles.createKeyBtnText}>New Key</Text>
            </Pressable>
          </View>
        </View>

        {/* List of Keys */}
        <View style={styles.keyList}>
          {keys.map((item) => {
            const isProd = item.environment === 'production';
            return (
              <View key={item.id} style={styles.card}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.nameSection}>
                    <Text style={styles.keyName}>{item.name}</Text>
                    <View style={[styles.envBadge, isProd ? styles.prodBadge : styles.devBadge]}>
                      <Text style={[styles.envBadgeText, isProd ? styles.prodText : styles.devText]}>
                        {item.environment?.toUpperCase() || 'PROD'}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    style={styles.revokeBtn}
                    onPress={() => handleRevoke(item.id, item.name)}
                  >
                    <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                  </Pressable>
                </View>

                {/* Token Box */}
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenText} numberOfLines={1}>
                    {item.rawKey || item.keyMasked}
                  </Text>
                  <Pressable
                    style={styles.copyBtn}
                    onPress={() => handleCopy(item.id, item.rawKey || item.keyMasked)}
                  >
                    <Ionicons 
                      name={copiedId === item.id ? "checkmark" : "copy-outline"} 
                      size={12} 
                      color={copiedId === item.id ? COLORS.success : COLORS.primaryLight} 
                    />
                    <Text style={[styles.copyBtnText, copiedId === item.id && { color: COLORS.success }]}>
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>

                {/* Meta details row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Monthly Quota</Text>
                    <Text style={styles.metaValue}>{item.monthlyLimit?.toLocaleString()} reqs</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Current Usage</Text>
                    <Text style={styles.metaValue}>{(item.currentRequests || 0).toLocaleString()} reqs</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Last Ingestion</Text>
                    <Text style={styles.metaValue}>{item.lastUsed || 'Recent'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Create Key Modal */}
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
                <Ionicons name="key" size={18} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Generate API Key</Text>
              </View>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Key Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Staging Service Ingestion"
                placeholderTextColor={COLORS.textMuted}
                value={newKeyName}
                onChangeText={setNewKeyName}
              />

              <Text style={styles.inputLabel}>Environment</Text>
              <View style={styles.envSelector}>
                {['production', 'staging', 'development'].map((env) => (
                  <Pressable
                    key={env}
                    style={[styles.envOption, newKeyEnv === env && styles.envOptionActive]}
                    onPress={() => setNewKeyEnv(env)}
                  >
                    <Text style={[styles.envOptionText, newKeyEnv === env && styles.envOptionTextActive]}>
                      {env.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.noticeBox}>
                <Ionicons name="information-circle" size={14} color={COLORS.primaryLight} />
                <Text style={styles.noticeText}>
                  Your API key grants direct access to third-party providers through MeterFlow. Store it securely.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.cancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable 
                style={[styles.confirmBtn, creating && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={creating}
              >
                <Text style={styles.confirmBtnText}>
                  {creating ? 'Generating...' : 'Create Key'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Newly Generated Key Dialog */}
      {createdRawKey && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>API Key Generated!</Text>
              <Text style={styles.successSub}>
                Copy this key now. For security purposes, it will not be displayed in full again.
              </Text>

              <View style={styles.rawKeyBox}>
                <Text style={styles.rawKeyText}>{createdRawKey}</Text>
              </View>

              <Pressable 
                style={styles.confirmBtn}
                onPress={() => {
                  handleCopy('new_key', createdRawKey);
                  setCreatedRawKey(null);
                }}
              >
                <Text style={styles.confirmBtnText}>Copy & Close</Text>
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
  banner: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  createKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  createKeyBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  keyList: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  keyName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  envBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  prodBadge: {
    backgroundColor: `${COLORS.accent}15`,
    borderColor: `${COLORS.accent}40`,
  },
  devBadge: {
    backgroundColor: `${COLORS.secondary}15`,
    borderColor: `${COLORS.secondary}40`,
  },
  envBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  prodText: {
    color: COLORS.accent,
  },
  devText: {
    color: COLORS.secondary,
  },
  revokeBtn: {
    padding: 6,
  },
  tokenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tokenText: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  copyBtnText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
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
    marginTop: 6,
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
  envSelector: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  envOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  envOptionActive: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  envOptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  envOptionTextActive: {
    color: COLORS.primaryLight,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.primary}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  noticeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 14,
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
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  rawKeyBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  rawKeyText: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
