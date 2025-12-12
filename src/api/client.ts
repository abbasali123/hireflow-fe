import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiResponse<T> = {
  data: T;
  status: number;
};

export type ApiError<T = unknown> = AxiosError<T>;

const handleUnauthorized = () => {
  localStorage.removeItem('hf_token');
  window.location.href = '/login';
};

const apiClient = axios.create({
  baseURL: baseUrl,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('hf_token');

  if (token) {
    config.headers = (config.headers || {}) as AxiosRequestHeaders;
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers = (config.headers || {}) as AxiosRequestHeaders;
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

const request = async <T>(
  method: HttpMethod,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  const response = (await apiClient.request({
    url: path,
    method,
    data,
    ...config,
  })) as AxiosResponse<T>;

  return {
    data: response.data,
    status: response.status,
  };
};

const api = {
  get: <T>(path: string, config?: AxiosRequestConfig) => request<T>('GET', path, undefined, config),
  post: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('POST', path, data, config),
  put: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('PUT', path, data, config),
  patch: <T>(path: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('PATCH', path, data, config),
  delete: <T>(path: string, config?: AxiosRequestConfig) => request<T>('DELETE', path, undefined, config),
};

export default api;
