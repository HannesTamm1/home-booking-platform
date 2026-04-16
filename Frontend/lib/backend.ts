export type Listing = {
  id: number;
  title: string;
  pricePerNight: number;
  maxGuests: number;
  createdAt: string | null;
  host: {
    publicLabel: string;
  };
  metrics: {
    confirmedBookings: number;
    confirmedRevenue: number;
  };
};

export type ListingsResponse = {
  data: Listing[];
  meta: {
    totalListings: number;
    averagePricePerNight: number;
    generatedAt: string;
  };
};

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

export async function fetchListings() {
  let backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;
  let endpoint = "";

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

    const payload = (await response.json()) as ListingsResponse;

    return {
      backendUrl,
      endpoint,
      error: null,
      payload,
    };
  } catch (error) {
    return {
      backendUrl,
      endpoint,
      error:
        error instanceof Error ? error.message : "Unknown backend connection error",
      payload: null,
    };
  }
}
