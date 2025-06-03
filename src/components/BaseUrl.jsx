import axios from "axios";
import secureLocalStorage from "react-secure-storage";

const BaseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  validateStatus: (status) => status == 200 || status == 201,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

BaseUrl.interceptors.request.use(
  (request) => {
    const token = secureLocalStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BaseUrl.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return BaseUrl(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/refresh`,
          {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const newToken = response.data.token;

        if (newToken) {
          secureLocalStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          return BaseUrl(originalRequest);
        } else {
          throw new Error("No token received from refresh");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        secureLocalStorage.removeItem("token");
        processQueue(refreshError, null);
        isRefreshing = false;

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status === 401) {
      secureLocalStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default BaseUrl;
