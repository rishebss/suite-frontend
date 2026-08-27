/**
 * API Utility for HTTP requests
 * Handles authentication and base URL configuration
 */

import axios from "axios";

class API {
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "/api/auth",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add token to every request
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Handle token refresh on 401
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              const response = await axios.post(
                `${this.instance.defaults.baseURL}/token/refresh/`,
                { refresh: refreshToken },
              );

              const { access } = response.data;
              localStorage.setItem("access_token", access);

              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Redirect to login if refresh fails
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      },
    );
  }

  get(url, config) {
    return this.instance.get(url, config);
  }

  post(url, data, config) {
    return this.instance.post(url, data, config);
  }

  patch(url, data, config) {
    return this.instance.patch(url, data, config);
  }

  put(url, data, config) {
    return this.instance.put(url, data, config);
  }

  delete(url, config) {
    return this.instance.delete(url, config);
  }
}

export default new API();
