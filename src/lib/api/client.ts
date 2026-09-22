const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5199";

const AUTH_STORAGE_KEY = "veritas.auth";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function getToken(): string | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
        return (JSON.parse(raw) as { token: string }).token;
    } catch {
        return null;
    }
}

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.clone().json();
        if (typeof data === "string") return data;
        if (data?.message) return data.message as string;
        if (data?.title) return data.title as string;
        return JSON.stringify(data);
    } catch {
        try {
            const text = await response.text();
            return text || response.statusText;
        } catch {
            return response.statusText;
        }
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData) && options.body) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new ApiError(response.status, await parseErrorMessage(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        return (await response.json()) as T;
    }

    return undefined as T;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),

    post: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: "POST",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    put: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: "PUT",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

    upload: <T>(path: string, formData: FormData) =>
        request<T>(path, { method: "POST", body: formData }),

    async downloadBlob(path: string): Promise<Blob> {
        const token = getToken();
        const headers = new Headers();
        if (token) headers.set("Authorization", `Bearer ${token}`);

        const response = await fetch(`${API_BASE_URL}${path}`, { headers });

        if (!response.ok) {
            throw new ApiError(response.status, await parseErrorMessage(response));
        }

        return response.blob();
    },
};

export { AUTH_STORAGE_KEY };
