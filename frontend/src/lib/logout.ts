import { clearAccessToken } from "./auth";

export async function logout(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!) {
  try {
    await fetch(baseUrl + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearAccessToken();
  }
}
