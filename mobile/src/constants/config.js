import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_API_URL = 'meterflow_mobile_api_url';
export const CLOUD_URL = 'https://meterflow-1hcu.onrender.com/api/v1';
export const LOCAL_URL = 'http://localhost:5001/api/v1';

// On mobile devices (Android / iOS), localhost refers to the phone itself, NOT your computer.
// To connect to your backend from a mobile phone, we use the live Cloud URL (https://meterflow-1hcu.onrender.com/api/v1).
// On Web, localhost:5001 works because the browser and backend run on the same computer.
const DEFAULT_URL = Platform.select({
  web: LOCAL_URL,
  android: CLOUD_URL,
  ios: CLOUD_URL,
  default: CLOUD_URL,
});

export const CONFIG = {
  DEFAULT_API_URL: DEFAULT_URL,
  PROD_API_URL: CLOUD_URL,
  LOCAL_API_URL: LOCAL_URL,

  async getApiBaseUrl() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
      // Ignore any saved 'localhost' or '127.0.0.1' on mobile devices
      if (stored && stored.trim().length > 0) {
        const clean = stored.trim().replace(/\/+$/, '');
        if (Platform.OS !== 'web' && (clean.includes('localhost') || clean.includes('127.0.0.1') || clean.includes('10.0.2.2'))) {
          return DEFAULT_URL;
        }
        return clean;
      }
    } catch { }
    return DEFAULT_URL;
  },

  async setApiBaseUrl(url) {
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      await AsyncStorage.setItem(STORAGE_KEY_API_URL, cleanUrl);
      return cleanUrl;
    } catch {
      return DEFAULT_URL;
    }
  },

  async resetApiBaseUrl() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
    } catch { }
    return DEFAULT_URL;
  }
};
