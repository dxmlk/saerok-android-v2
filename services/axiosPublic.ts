import axios from "axios";
import { Platform } from "react-native";
import { beginApiRequest } from "@/services/apiLoading";

function resolveBaseURL() {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && env.length > 0) return env;

  // fallback (ENV 안 읽힐 때)
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }
  return "http://localhost:8080";
}

const baseURL = resolveBaseURL();
console.log("[axiosPublic] baseURL =", baseURL);

const axiosPublic = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

axiosPublic.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase() ?? "get";
    const explicitShowOverlay = (config as any).showOverlay;
    const showOverlay =
      typeof explicitShowOverlay === "boolean"
        ? explicitShowOverlay
        : !["get", "head", "options"].includes(method);
    (config as any).__endApiLoading = beginApiRequest({ showOverlay });
    return config;
  },
  (error) => Promise.reject(error),
);

axiosPublic.interceptors.response.use(
  (res) => {
    (res.config as any).__endApiLoading?.();
    return res;
  },
  (error) => {
    error?.config?.__endApiLoading?.();
    return Promise.reject(error);
  },
);

export default axiosPublic;
