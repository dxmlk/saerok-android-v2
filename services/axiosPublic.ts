import axios from "axios";
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
console.log("[axiosPublic] baseURL =", baseURL);

const axiosPublic = axios.create({
  baseURL,
  timeout: 15000,
});

export default axiosPublic;
