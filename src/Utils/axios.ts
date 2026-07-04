import axiosBase from "axios";
import { getTokens, setTokens } from "./auth";
import { API_URL } from "./constants";
import { logoutUser } from "../Redux/Ducks/userSlice";
import store from "../Redux/configureStore";

const axios: any = axiosBase.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json", // Make sure this is set
    Accept: "application/json",
  },
});

// Attach Authorization token for every request
axios.interceptors.request.use((config: any) => {
  const token = getTokens()?.AccessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response/error handling
axios.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Dispatch logout action
      store.dispatch(logoutUser());

      // Optional: redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Generic executor
const execute = async (method: string, ...args: any) => {
  try {
    const response = await axios[method](...args);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
};

const get = (...args: any) => execute("get", ...args);
const post = (...args: any) => execute("post", ...args);
const put = (...args: any) => execute("put", ...args);
const remove = (...args: any) => execute("delete", ...args);

export { get, post, put, remove };
export default execute;
