// lib/apiClient.server.ts
import { auth } from "@clerk/nextjs/server";

const apiUrl = process.env.API_URL || "http://localhost:3000/api/v1"; // Full URL for server-side

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
  const token = await getToken();

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
    cache: 'no-store', // Important for server-side requests
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
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