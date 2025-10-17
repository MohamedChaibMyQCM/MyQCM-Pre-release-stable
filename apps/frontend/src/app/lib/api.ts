"use client";

const DEFAULT_API_BASE = "http://localhost:3001";
const ACCESS_TOKEN_KEY = "freelancer_access_token";
const REFRESH_TOKEN_KEY = "freelancer_refresh_token";
let refreshPromise: Promise<string | null> | null = null;

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const resolveApiBase = () => {
  const base =
    process.env.NEXT_PUBLIC_API_BASE && process.env.NEXT_PUBLIC_API_BASE.trim()
      ? process.env.NEXT_PUBLIC_API_BASE
      : DEFAULT_API_BASE;

  return base.replace(/\/$/, "");
};

export const getApiBaseUrl = () => resolveApiBase();

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearStoredTokens = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const parseJsonSafely = (text: string) => {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const performAccessTokenRefresh = async (): Promise<string | null> => {
  const apiBase = resolveApiBase();
  try {
    const response = await fetch(`${apiBase}/auth/freelancer/refresh`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const payload = parseJsonSafely(await response.text());
    const newToken =
      (typeof payload === "string" ? payload : null) ??
      (typeof payload?.token === "string"
        ? payload.token
        : payload?.token?.accessToken ?? null);

    if (newToken) {
      setAccessToken(newToken);
      return newToken;
    }

    return null;
  } catch {
    return null;
  }
};

const requestAccessTokenRefresh = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performAccessTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  tokenRequired?: boolean;
  signal?: AbortSignal;
};

export async function apiFetch<T = unknown>(
  path: string,
  {
    method = "GET",
    body,
    headers = {},
    tokenRequired = true,
    signal,
  }: ApiFetchOptions = {},
): Promise<T> {
  const apiBase = resolveApiBase();
  const finalHeaders: Record<string, string> = { ...headers };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let preparedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormData) {
      preparedBody = body as FormData;
    } else if (
      typeof body === "string" ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      preparedBody = body as BodyInit;
    } else {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] ?? "application/json";
      preparedBody = JSON.stringify(body);
    }
  }

  if (tokenRequired) {
    const token = getAccessToken();
    if (!token) {
      throw new UnauthorizedError();
    }
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const executeRequest = () =>
    fetch(`${apiBase}${path}`, {
      method,
      headers: finalHeaders,
      body: preparedBody,
      signal,
      credentials: "include",
    });

  let response = await executeRequest();

  if (response.status === 401 && tokenRequired) {
    const refreshedToken = await requestAccessTokenRefresh();
    if (refreshedToken) {
      finalHeaders.Authorization = `Bearer ${refreshedToken}`;
      response = await executeRequest();
    }
  }

  if (response.status === 401) {
    clearStoredTokens();
    throw new UnauthorizedError();
  }

  const responseText = await response.text();
  const parsed = parseJsonSafely(responseText) ?? responseText;

  if (!response.ok) {
    const message =
      (typeof parsed === "object" &&
        parsed !== null &&
        "message" in parsed &&
        parsed.message) ||
      response.statusText ||
      "Request failed";
    throw new Error(String(message));
  }

  return parsed as T;
}

export async function uploadSignedFile(pathOrUrl: string, file: File | Blob) {
  const formData = new FormData();
  formData.append("file", file);

  if (/^https?:\/\//i.test(pathOrUrl)) {
    const headers: Record<string, string> = {};
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const requestInit: RequestInit = {
      method: "PUT",
      body: formData,
      headers,
    };
    if (pathOrUrl.startsWith(resolveApiBase())) {
      requestInit.credentials = "include";
    }
    const response = await fetch(pathOrUrl, requestInit);

    if (response.status === 401) {
      clearStoredTokens();
      throw new UnauthorizedError();
    }

    if (!response.ok) {
      throw new Error(
        `File upload failed with status ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text;
    }
  }

  return apiFetch(pathOrUrl, {
    method: "PUT",
    body: formData,
  });
}

export const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    clearStoredTokens();
    window.location.href = "/freelence/login";
  }
};
