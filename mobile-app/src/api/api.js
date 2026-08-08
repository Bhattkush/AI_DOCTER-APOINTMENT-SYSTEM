import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const envApiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest?.extra?.apiUrl;

/**
 * IMPORTANT - set this to your machine's LAN IP (not "localhost") when
 * testing on a real phone with Expo Go, e.g. "http://192.168.1.5:8000".
 * "localhost" only works for iOS simulator. For Android emulator use
 * "http://10.0.2.2:8000".
 */
const defaultApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

export const API_BASE_URL = envApiUrl || defaultApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach JWT token to every request automatically.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central error handling - surfaces FastAPI's `detail` message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(detail));
  }
);

export default api;
