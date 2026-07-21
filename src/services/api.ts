/**
 * Core API & Fetch Base client
 * 
 * TODO: Implement common HTTP interceptors, headers, and environment-based baseURL config.
 */
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = (import.meta as any).env.VITE_API_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  console.log(`[API Client] Request to: ${url}`);
  // TODO: Implement centralized request handling, bearer tokens, error handling, etc.
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
