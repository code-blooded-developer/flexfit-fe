import { buildApiUrl } from "@/lib/apiBase";
import { ApiResponse } from "@/types/api";
import { ApiError } from "@/lib/apiError";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(buildApiUrl("/auth/refresh"), {
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

  const url = buildApiUrl(endpoint);

  const finalUrl = new URL(url, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      finalUrl.searchParams.set(key, val),
    );
  }

  const res = await fetch(finalUrl.toString(), {
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

    window.location.href = "/login";
    throw new ApiError("Session expired", 401);
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
