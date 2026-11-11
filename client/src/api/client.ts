export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown; // any data we can turn into JSON
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {}
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null as T; // success with no content

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message || 'Something went wrong', res.status);
  }
  return data as T;
}