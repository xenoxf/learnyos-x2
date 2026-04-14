/**
 * Check if current user is a guest
 */
export function isGuestUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return true;
    const user = JSON.parse(userStr);
    return user?.isGuest === true;
  } catch {
    return true;
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}
