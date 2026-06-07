import { ApiError } from "@/lib/apiError";
import { ApiResponse } from "@/types/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/api/v1"
    : "/api/v1";

const buildUrl = (
  endpoint: string,
  params?: Record<string, string>,
): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const url = new URL(
    `${API_BASE}${cleanEndpoint}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return false;
    }

    const json: ApiResponse<unknown> = await res.json();

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

  const res = await fetch(buildUrl(endpoint, params), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if ((json.status === 401 || json.status === 403) && retry) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      return request<T>(endpoint, options, false);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new ApiError("Session expired", 401);
  }

  if (!json.success) {
    throw new ApiError(json.message, json.status);
  }

  return json.data;
}

const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "GET",
    }),

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
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
    }),
};

export default api;
