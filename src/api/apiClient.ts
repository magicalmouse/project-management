import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
});

axiosInstance.interceptors.request.use(
	(config) => {
		// Get the access token from userStore
		const userState = userStore.getState();
		const accessToken = userState.userToken?.access_token;

		console.log("🔍 API Request Interceptor:");
		console.log("URL:", config.url);
		console.log("Method:", config.method);
		console.log("User state:", userState);
		console.log("Access token present:", !!accessToken);

		// Add Authorization header if token exists
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
			console.log("✅ Authorization header added:", `Bearer ${accessToken.substring(0, 20)}...`);
		} else {
			console.log("❌ No access token found in userStore");
		}

		// Set Content-Type header only for non-FormData requests
		if (!(config.data instanceof FormData)) {
			config.headers["Content-Type"] = "application/json;charset=utf-8";
		}

		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<any>) => {
		console.log("✅ API Response Success:", res.config.url);
		// Backend returns direct response format
		return res.data;
	},
	(error: AxiosError<any>) => {
		const { response, message } = error || {};
		const errMsg = response?.data?.error || message || t("sys.api.errorMessage");

		console.log("❌ API Response Error:");
		console.log("URL:", error.config?.url);
		console.log("Status:", response?.status);
		console.log("Error message:", errMsg);
		console.log("Response data:", response?.data);

		// Don't show toast for 401 errors to avoid multiple notifications
		if (response?.status !== 401) {
			toast.error(errMsg, { position: "top-center" });
		}

		if (response?.status === 401) {
			console.log("🔐 401 Unauthorized - clearing user data and redirecting to login");
			// Clear user token and info
			userStore.getState().actions.clearUserInfoAndToken();

			// Redirect to login page
			window.location.href = "/auth/login";
		}

		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
