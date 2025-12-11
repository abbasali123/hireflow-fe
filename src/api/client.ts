const baseUrl = import.meta.env.VITE_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiResponse<T> = {
  data: T;
  status: number;
};

const handleUnauthorized = () => {
  localStorage.removeItem('hf_token');
  window.location.href = '/login';
};

const request = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('hf_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  const responseData = (await response.json().catch(() => null)) as T;

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return {
    data: responseData,
    status: response.status,
  };
};

const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export default api;
