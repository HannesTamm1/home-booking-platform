const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

function getBackendBaseUrl() {
  const backendUrl = (
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    DEFAULT_BACKEND_URL
  ).replace(/\/$/, "");

  const parsedUrl = new URL(backendUrl);
  const isLocalDevelopmentHost =
    parsedUrl.hostname === "127.0.0.1" ||
    parsedUrl.hostname === "localhost";

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("Production backend URL must use HTTPS");
  }

  if (!isLocalDevelopmentHost && parsedUrl.protocol !== "https:") {
    throw new Error("Remote backend URL must use HTTPS");
  }

  return backendUrl;
}

export async function fetchLaravelStatus() {
  let backendUrl =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    DEFAULT_BACKEND_URL;
  let endpoint = `${backendUrl.replace(/\/$/, "")}/api/listings`;

  try {
    backendUrl = getBackendBaseUrl();
    endpoint = new URL("/api/listings", `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return {
      backendUrl,
      endpoint,
      error: null,
      isConnected: true,
    };
  } catch (error) {
    return {
      backendUrl,
      endpoint,
      error:
        error instanceof Error ? error.message : "Unknown backend connection error",
      isConnected: false,
    };
  }
}
