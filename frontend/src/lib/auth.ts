export function getAccessToken(): string | null {
  const match = document.cookie.match(/(^| )accessToken=([^;]+)/);
  return match ? match[2] : null;
}

export function setAccessToken(token: string, expiresAt: number) {
  const expires = new Date(expiresAt * 1000).toUTCString();
  document.cookie = `accessToken=${token}; Path=/; Expires=${expires}; SameSite=Strict`;
}

export function clearAccessToken() {
  document.cookie =
    "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
