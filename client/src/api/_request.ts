import type { ApiResponse } from "@/types/files"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

const RETRY_DELAYS_MS = [500, 1000, 2000]

export async function _request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  let lastError = "Network error"

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      })
      return res.json() as Promise<ApiResponse<T>>
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error"
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS_MS[attempt])
        )
      }
    }
  }

  return { ok: false, error: lastError }
}
