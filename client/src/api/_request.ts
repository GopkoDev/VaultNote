import type { ApiResponse } from "@/types/files"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

export async function _request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  return res.json() as Promise<ApiResponse<T>>
}
