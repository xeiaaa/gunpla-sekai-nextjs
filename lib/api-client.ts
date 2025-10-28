import { auth } from "@clerk/nextjs/server";

// lib/apiClient.ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: any;
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  options: RequestOptions = {}
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken()

  const queryString = options.query
    ? "?" +
    new URLSearchParams(
      Object.entries(options.query).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString()
    : "";

  const url = `${apiUrl}${endpoint}${queryString}`;

  // Build headers safely
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }


  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  // ✅ Handle empty response or JSON safely
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json(); // ✅ Parse valid JSON
  } else {
    // ✅ Return text or empty response safely
    const text = await response.text();
    return (text ? (text as unknown as T) : ({} as T));
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, "GET", options),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, "POST", { ...options, body }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, "PUT", { ...options, body }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, "PATCH", { ...options, body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, "DELETE", options),
};
