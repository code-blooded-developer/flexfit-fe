import { ApiError } from "@/lib/apiError";
import { USE_MOCKS } from "@/lib/mock/config";
import { ApiResponse } from "@/types/api";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * Fixture mode answers from `app/api/v1/[...path]`, so it has to be same-origin.
 * Production already is; only dev normally points at the Spring backend.
 */
const API_BASE = USE_MOCKS
  ? "/api/v1"
  : process.env.NODE_ENV === "development"
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

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const { params, ...init } = options;

  let res: Response;
  try {
    res = await fetch(buildUrl(endpoint, params), {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Network error", 0);
  }

  if ((res.status === 401 || res.status === 403) && retry) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      return request<T>(endpoint, options, false);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new ApiError("Session expired", 401);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiError(
        `Request failed with status ${res.status}`,
        res.status,
      );
    }
    throw new ApiError("Invalid response format", res.status);
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
