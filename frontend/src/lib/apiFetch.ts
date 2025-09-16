import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = getAccessToken();

  const res = await fetch(baseUrl + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (res.status !== 401) {
    return res;
  }

  const refreshRes = await fetch(baseUrl + "/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!refreshRes.ok) {
    clearAccessToken();
    window.location.href = "/auth/login";
    throw new Error("Unauthorized, redirecting to login");
  }

  const refreshData = await refreshRes.json();
  setAccessToken(refreshData.accessToken, refreshData.expiresAt);

  const newToken = getAccessToken();
  return fetch(baseUrl + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
    },
    credentials: "include",
  });
}
