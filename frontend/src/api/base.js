import axios from "axios";
import { navigateTo } from "../utils/navigateHelper";

let BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error("VITE_API_BASE_URL is not defined in environment variables.");
  BASE_URL = "http://localhost:5001/api/v1/";
}

// global token variable
let authToken = null;

//setter function
export const setAuthToken = (token) => {
  authToken = token;
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("401 Unauthorized. Session expired or invalid token.");
      localStorage.removeItem("idToken");
      navigateTo("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
