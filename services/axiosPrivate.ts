import { getAccessToken, setAccessToken, clearTokens } from "@/lib/tokenStore";
import axios, { InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import axiosPublic from "@/services/axiosPublic";
import { refreshAccessTokenApi } from "@/services/api/auth";

function resolveBaseURL() {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && env.length > 0) return env;

  if (Platform.OS === "android") return "http://10.0.2.2:8080";
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
      config.headers?.set?.("Authorization", `Bearer ${token}`);
      if (!config.headers?.set) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    console.log(
      `[API ➜] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let waitQueue: Array<(token: string) => void> = [];

function enqueue(cb: (token: string) => void) {
  waitQueue.push(cb);
}
function flush(token: string) {
  waitQueue.forEach((cb) => cb(token));
  waitQueue = [];
}

axiosPrivate.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    // ✅ 401 → refresh 후 1회 재시도
    if (status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          enqueue((token) => {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosPrivate(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // refresh 요청은 public axios로
        const refreshed = await refreshAccessTokenApi();
        const newToken = refreshed.accessToken;

        await setAccessToken(newToken);
        flush(newToken);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosPrivate(original);
      } catch (e) {
        await clearTokens();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosPrivate;
