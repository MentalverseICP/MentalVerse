// frontend/src/services/httpClient.ts
/// <reference types="vite/client" />
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

class HttpClient {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor(config: HttpClientConfig = {}) {
    const { baseURL = BASE_URL, timeout = 10000, maxRetries = 2 } = config;

    this.maxRetries = maxRetries;
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error(
          "HTTP Client Error:",
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response: AxiosResponse<T> = await this.client.request(config);
        return response.data;
      } catch (error: unknown) {
        lastError = error;

        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status >= 400 && error.response.status < 500) {
            break; // do not retry on client errors
          }
        }

        if (attempt === this.maxRetries) {
          break; // stop if we've exhausted retries
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ url, method: "GET", ...config });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ url, method: "POST", data, ...config });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ url, method: "PUT", data, ...config });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ url, method: "DELETE", ...config });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ url, method: "PATCH", data, ...config });
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get("/health");
  }

  // Chat API methods
  async sendChatMessage(
    message: string,
    conversationId?: string
  ): Promise<unknown> {
    return this.post("/api/chat", { message, conversationId });
  }

  // Resource API methods
  async getResources(category?: string): Promise<unknown> {
    const params = category ? { category } : {};
    return this.get("/api/resources", { params });
  }

  // Interaction logging
  async logInteraction(interactionData: unknown): Promise<void> {
    return this.post("/api/log-interaction", interactionData);
  }

  // Unified chat API wrapper
  async chat(payload: {
    messages: { role: string; content: string }[];
    sessionId?: string;
    userPrincipal?: string;
  }): Promise<{ message: { content: string }; analysis?: any }> {
    return this.post("/api/chat", payload);
  }
}

// Create singleton instance
const httpClient = new HttpClient();

// Export singleton instance
export default httpClient;

// Export named instance
export { httpClient };

// Export class for custom instances
export { HttpClient };

// Export types
export type { HttpClientConfig };
