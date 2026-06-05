const BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";
const MODE = process.env.NEXT_PUBLIC_API_MODE;

export const buildApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Case 1: absolute backend (different domain or localhost)
  if (MODE === "absolute" && BASE.startsWith("http")) {
    return `${BASE}${cleanEndpoint}`;
  }

  // Case 2: same-domain Nginx proxy OR fallback
  return `${BASE}${cleanEndpoint}`;
};
