import axios from "axios";
 const backendUrl = import.meta.env.VITE_BACKEND_URL
 const axiosInstance = axios.create({
  baseURL: `${backendUrl.toString()}/api`,
  withCredentials: true,
});

export default axiosInstance