import React, { createContext, useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ToastContext = createContext({
  showToast: (message, type) => {},
});

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: insets.top + (Platform.OS === 'android' ? 10 : 0),
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }, 3500);
  };

  const getTheme = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: '#064E3B',
          border: '#059669',
          icon: 'checkmark-circle',
          iconColor: '#34D399',
        };
      case 'error':
        return {
          bg: '#7F1D1D',
          border: '#DC2626',
          icon: 'alert-circle',
          iconColor: '#F87171',
        };
      case 'warning':
        return {
          bg: '#78350F',
          border: '#D97706',
          icon: 'warning',
          iconColor: '#FBBF24',
        };
      default:
        return {
          bg: '#1E3A8A',
          border: '#2563EB',
          icon: 'information-circle',
          iconColor: '#60A5FA',
        };
    }
  };

  const currentTheme = toast ? getTheme(toast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Ionicons name={currentTheme.icon} size={20} color={currentTheme.iconColor} style={styles.icon} />
          <Text style={styles.toastText} numberOfLines={3}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
