import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ToastProvider } from './src/components/Toast';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent />
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
