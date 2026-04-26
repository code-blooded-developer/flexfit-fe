import { ApiResponse } from "@/types/api";
import { ApiError } from "@/lib/apiError";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const { params, ...init } = options;

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.set(key, val),
    );
  }

  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  // Access token expired mid-session — try refresh once then retry
  if (json.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
    // Refresh also failed — session is dead
    window.location.href = "/auth/login";
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!json.success) {
    throw new ApiError(json.message, json.status);
  }

  return json.data;
}

const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
