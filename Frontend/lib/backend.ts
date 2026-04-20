export type AuthUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
};

export type Listing = {
  id: number;
  title: string;
  pricePerNight: number;
  maxGuests: number;
  host: {
    publicLabel: string;
  };
  metrics: {
    confirmedBookings: number;
    confirmedRevenue: number;
  };
  createdAt: string | null;
};

export type ListingsResponse = {
  data: Listing[];
  meta: {
    totalListings: number;
    averagePricePerNight: number;
    generatedAt: string;
    pagination: {
      currentPage: number;
      perPage: number;
      lastPage: number;
      hasMorePages: boolean;
    };
  };
};

function getConfiguredBackendUrl() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL must be configured");
  }

  return backendUrl.replace(/\/$/, "");
}

export function getBackendBaseUrl() {
  const backendUrl = getConfiguredBackendUrl();

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
  let backendUrl = process.env.BACKEND_URL ?? "";
  let endpoint = backendUrl ? `${backendUrl.replace(/\/$/, "")}/api/listings` : "";

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

export async function fetchListings(perPage = 6): Promise<
  | {
      backendUrl: string;
      endpoint: string;
      error: null;
      isConnected: true;
      listings: ListingsResponse;
    }
  | {
      backendUrl: string;
      endpoint: string;
      error: string;
      isConnected: false;
      listings: null;
    }
> {
  let backendUrl = process.env.BACKEND_URL ?? "";
  let endpoint = backendUrl ? `${backendUrl.replace(/\/$/, "")}/api/listings?per_page=${perPage}` : "";

  try {
    backendUrl = getBackendBaseUrl();
    endpoint = new URL(`/api/listings?per_page=${perPage}`, `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const listings = (await response.json()) as ListingsResponse;

    return {
      backendUrl,
      endpoint,
      error: null,
      isConnected: true,
      listings,
    };
  } catch (error) {
    return {
      backendUrl,
      endpoint,
      error:
        error instanceof Error ? error.message : "Unknown backend connection error",
      isConnected: false,
      listings: null,
    };
  }
}
