import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator, Modal } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AnimatedLoader({ 
  message = 'Loading...', 
  size = 'default',
  fullscreen = false 
}) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous rotation animation
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Continuous breathing pulse animation
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.12,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1.0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnim.start();
    pulseAnim.start();

    return () => {
      spinAnim.stop();
      pulseAnim.stop();
    };
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const content = (
    <View style={styles.container}>
      {/* Ring and Center Icon perfectly aligned */}
      <View style={styles.ringWrapper}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: pulseValue }, { rotate: spin }],
            },
          ]}
        >
          <View style={styles.glowDot} />
        </Animated.View>

        {/* Central Icon Badge */}
        <View style={[styles.centerBadge, !fullscreen && styles.centerBadgeLight]}>
          <Ionicons name="flash" size={24} color={fullscreen ? "#60A5FA" : COLORS.primary} />
        </View>
      </View>

      {/* Dynamic Animated Status Message */}
      {message ? (
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, !fullscreen && styles.messageTextLight]}>{message}</Text>
          <View style={styles.spinnerRow}>
            <ActivityIndicator size="small" color={fullscreen ? "#60A5FA" : COLORS.primary} />
          </View>
        </View>
      ) : null}
    </View>
  );

  if (fullscreen) {
    return (
      <Modal 
        transparent 
        animationType="fade" 
        visible={true}
        statusBarTranslucent
      >
        <View style={styles.fullscreenOverlay}>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Semi-transparent dark blur overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  ringWrapper: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderTopColor: '#38BDF8',
    borderRightColor: '#60A5FA',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
    marginTop: -4,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  centerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  centerBadgeLight: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: `${COLORS.primary}35`,
    shadowOpacity: 0.08,
  },
  messageContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    maxWidth: 280,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  messageTextLight: {
    color: COLORS.text,
    textShadowColor: 'transparent',
    textShadowRadius: 0,
  },
  spinnerRow: {
    marginTop: SPACING.sm,
  },
});
