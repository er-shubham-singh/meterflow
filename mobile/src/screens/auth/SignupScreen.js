import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import AnimatedLoader from '../../components/AnimatedLoader';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      showToast(`Account created for ${name}! Please sign in.`, 'success');
      navigation.navigate('Login');
    }, 1000);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </Pressable>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Create Enterprise Account</Text>
              <Text style={styles.subtitle}>Join an existing workspace or set up new tenancy</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Organization Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Organization Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder="e.g. Acme Corp"
                  placeholderTextColor={COLORS.textMutedLight}
                />
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Jane Doe"
                  placeholderTextColor={COLORS.textMutedLight}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Work Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@company.com"
                  placeholderTextColor={COLORS.textMutedLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textMutedLight}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Role Select */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Initial Role</Text>
              <View style={styles.roleToggleContainer}>
                <Pressable
                  style={[styles.roleTab, role === 'employee' && styles.roleTabActiveEmployee]}
                  onPress={() => setRole('employee')}
                >
                  <Ionicons name="person-outline" size={14} color={role === 'employee' ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.roleTabText, role === 'employee' && styles.roleTabTextActive]}>
                    Developer
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.roleTab, role === 'admin' && styles.roleTabActiveAdmin]}
                  onPress={() => setRole('admin')}
                >
                  <Ionicons name="shield-checkmark-outline" size={14} color={role === 'admin' ? COLORS.secondary : COLORS.textMuted} />
                  <Text style={[styles.roleTabText, role === 'admin' && styles.roleTabTextActive]}>
                    Administrator
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Provision Account</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading ? (
        <AnimatedLoader fullscreen message="Provisioning workspace account..." />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  roleTabActiveEmployee: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  roleTabActiveAdmin: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.sm,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleTabTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    gap: 8,
    ...SHADOWS.md,
  },
  submitButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
