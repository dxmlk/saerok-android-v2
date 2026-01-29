import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

const axiosPublic = axios.create({
  baseURL,
  timeout: 15000,
});

export default axiosPublic;
