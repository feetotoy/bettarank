// Tiny client-side cookie helpers. Plain functions (not hooks/components), so
// they're free of the React Compiler immutability rule on `document.cookie`.
// Only call these from Client Component event handlers.

export function setCookie(name: string, value: string, maxAgeSeconds = 31536000) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}
