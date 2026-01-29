import { getAccessToken } from "../lib/tokenStore";
import axios, { InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

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

console.log("[axiosPrivate] baseURL =", baseURL);

const axiosPrivate = axios.create({
  baseURL,
  timeout: 15000,
});

axiosPrivate.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();

    if (token) {
      // Axios v1.x: headers는 AxiosHeaders 형태
      config.headers?.set?.("Authorization", `Bearer ${token}`);
      // 혹시 set이 없을 경우(환경/타입 꼬임 대비)
      if (!config.headers?.set) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    console.log(
      `[API ➜] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    if (config.params) console.log(" params:", config.params);
    if (config.data) console.log(" data:", config.data);

    return config;
  },
  (error) => Promise.reject(error),
);

axiosPrivate.interceptors.response.use(
  (res) => {
    console.log(`[API ✓] ${res.status} ${res.config.url}`);
    return res;
  },
  (error) => {
    console.log(
      `[API ✗]`,
      error?.response?.status,
      error?.config?.url,
      error?.message,
    );
    if (error?.response?.data) {
      console.log(" body:", error.response.data);
    }
    return Promise.reject(error);
  },
);

export default axiosPrivate;
