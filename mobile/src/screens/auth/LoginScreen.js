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

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your corporate email and password.');
      showToast('Missing credentials', 'warning');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login({
      email: email.trim(),
      password,
      role,
    });

    setLoading(false);

    if (res.success && res.data) {
      showToast(`Welcome back, ${res.data.name}!`, 'success');
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please check credentials.');
      showToast(res.message || 'Login failed', 'error');
    }
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
          {/* Executive Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="flash" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>
                Meter<Text style={styles.brandAccent}>Flow</Text>
              </Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>ENTERPRISE</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>
              Usage-Based Pricing, API Gateway & Real-Time Showback
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={styles.errorIcon} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. Account Role Selector */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Select Role</Text>
                <Text style={styles.labelHint}>
                  {role === 'admin' ? 'Full governance & cost showback' : 'Developer quota & API proxy'}
                </Text>
              </View>

              <View style={styles.roleToggleContainer}>
                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'admin' && styles.roleTabActiveAdmin,
                  ]}
                  onPress={() => {
                    setRole('admin');
                    setErrorMsg('');
                  }}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={role === 'admin' ? '#7C3AED' : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      role === 'admin' && styles.roleTabTextActiveAdmin,
                    ]}
                  >
                    Administrator
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'employee' && styles.roleTabActiveEmployee,
                  ]}
                  onPress={() => {
                    setRole('employee');
                    setErrorMsg('');
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={role === 'employee' ? '#2563EB' : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      role === 'employee' && styles.roleTabTextActiveEmployee,
                    ]}
                  >
                    Developer
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 2. Corporate Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Corporate Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMsg('');
                  }}
                  placeholder="name@company.com"
                  placeholderTextColor={COLORS.textMutedLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 3. Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrorMsg('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textMutedLight}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* 4. Primary Sign In Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                role === 'admin' ? styles.submitButtonAdmin : styles.submitButtonEmployee,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                Sign In as {role === 'admin' ? 'Administrator' : 'Developer'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>

            {/* Switch to Signup */}
            <View style={styles.signupPromptRow}>
              <Text style={styles.signupPromptText}>Don't have an enterprise account? </Text>
              <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupPromptLink}>Create Account</Text>
              </Pressable>
            </View>

            {/* Security Notice */}
            <View style={styles.securityFooter}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.success} />
              <Text style={styles.securityText}>
                TLS 1.3 • Role-Based Access Control • SOC2 Compliant
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fullscreen Animated Loader */}
      {loading ? (
        <AnimatedLoader
          fullscreen
          message={`Signing in as ${role === 'admin' ? 'Administrator' : 'Developer'}...`}
        />
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
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
    marginBottom: SPACING.sm,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  versionBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  versionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 17,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  errorIcon: {
    marginRight: SPACING.sm,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  labelHint: {
    fontSize: 10,
    color: COLORS.textMuted,
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
  roleTabActiveAdmin: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.sm,
  },
  roleTabActiveEmployee: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleTabTextActiveAdmin: {
    color: COLORS.secondary,
    fontWeight: '800',
  },
  roleTabTextActiveEmployee: {
    color: COLORS.primary,
    fontWeight: '800',
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    gap: 8,
    ...SHADOWS.md,
  },
  submitButtonAdmin: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
  },
  submitButtonEmployee: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  submitButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupPromptText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  signupPromptLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: 6,
  },
  securityText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
