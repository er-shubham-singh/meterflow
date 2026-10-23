import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useCurrency } from '../context/CurrencyContext';

export default function HeaderBar({ title, subtitle = 'Live Gateway', onRefresh, rightAction }) {
  const insets = useSafeAreaInsets();
  const { currency, setCurrency } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Robust safe area calculation for Android notches & punch-holes
  const androidBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const safeTopPadding = Math.max(insets.top, androidBarHeight) + 6;

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 650,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      setIsRefreshing(false);
    });

    try {
      await onRefresh();
    } catch (err) {
      // Handled by caller
    }
  };

  const cycleCurrency = () => {
    if (currency === 'INR') setCurrency('USD');
    else if (currency === 'USD') setCurrency('EUR');
    else setCurrency('INR');
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <View style={styles.headerRow}>
        {/* Left: Screen Title & Compact Live Subtitle */}
        <View style={styles.titleGroup}>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.subtitleRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.screenSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>

        {/* Right: Refresh Button + Currency Switcher Pill (No profile icon in header) */}
        <View style={styles.actionsGroup}>
          {onRefresh && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={handleRefresh}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Refresh Telemetry"
              accessibilityRole="button"
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="refresh" size={17} color={COLORS.primary} />
              </Animated.View>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [styles.currencyChip, pressed && styles.pressed]}
            onPress={cycleCurrency}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cycle Currency"
            accessibilityRole="button"
          >
            <Text style={styles.currencySymbol}>
              {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}
            </Text>
            <Text style={styles.currencyText}>{currency}</Text>
          </Pressable>

          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm + 2,
    ...SHADOWS.sm,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  titleGroup: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: SPACING.sm,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  currencySymbol: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  currencyText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
