export type AuthUser = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  token: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: Omit<AuthUser, "token">;
};

export type Listing = {
  id: number;
  title: string;
  destination: string | null;
  description: string | null;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  latitude: number | null;
  longitude: number | null;
  photos?: Array<{ url: string; caption: string | null }>;
  host: {
    publicLabel: string;
  };
  metrics: {
    confirmedBookings: number;
    confirmedRevenue: number;
  };
  createdAt: string | null;
  updatedAt: string | null;
};

export type AvailabilityPeriod = { startDate: string; endDate: string };

export type BookingListing = {
  id: number;
  title: string;
  destination: string | null;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
};

export type Booking = {
  id: number;
  listingId: number;
  listing?: BookingListing;
  startDate: string;
  endDate: string;
  nights: number | null;
  totalPrice: number;
  currency: string;
  status: string;
  createdAt: string | null;
};

export type ListingsResponse = {
  data: Listing[];
  meta: {
    totalListings: number;
    averagePricePerNight: number;
    generatedAt: string;
    filters: {
      destination: string | null;
      guests: number | null;
      checkIn: string | null;
      checkOut: string | null;
      availableDestinations: string[];
    };
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

export async function backendFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const backendUrl = getBackendBaseUrl();
  const url = new URL(path, `${backendUrl}/`).toString();

  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
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
  return fetchListingsWithFilters({ perPage });
}

export async function fetchListingsWithFilters({
  perPage = 6,
  destination,
  guests,
  checkIn,
  checkOut,
  page,
}: {
  perPage?: number;
  destination?: string;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  page?: number;
}): Promise<
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
  const searchParams = new URLSearchParams({
    per_page: String(perPage),
  });

  if (page && page > 1) {
    searchParams.set("page", String(page));
  }

  if (destination) {
    searchParams.set("destination", destination);
  }

  if (guests) {
    searchParams.set("guests", String(guests));
  }

  if (checkIn && checkOut) {
    searchParams.set("check_in", checkIn);
    searchParams.set("check_out", checkOut);
  }

  let endpoint = backendUrl
    ? `${backendUrl.replace(/\/$/, "")}/api/listings?${searchParams.toString()}`
    : "";

  try {
    backendUrl = getBackendBaseUrl();
    endpoint = new URL(`/api/listings?${searchParams.toString()}`, `${backendUrl}/`).toString();

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

export async function fetchListing(
  id: string | number,
): Promise<{ listing: Listing | null; error: string | null }> {
  try {
    const backendUrl = getBackendBaseUrl();
    const endpoint = new URL(`/api/listings/${id}`, `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      return { listing: null, error: "Not found" };
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const payload = (await response.json()) as { data: Listing };
    return { listing: payload.data, error: null };
  } catch (error) {
    return {
      listing: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchListingAvailability(
  id: string | number,
): Promise<{ data: AvailabilityPeriod[]; error: string | null }> {
  try {
    const backendUrl = getBackendBaseUrl();
    const endpoint = new URL(`/api/listings/${id}/availability`, `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const payload = (await response.json()) as { data: AvailabilityPeriod[] };
    return { data: payload.data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchUserBookings(
  token: string,
): Promise<{ bookings: Booking[] | null; error: string | null }> {
  try {
    const backendUrl = getBackendBaseUrl();
    const endpoint = new URL("/api/user/bookings", `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const payload = (await response.json()) as { data: Booking[] };
    return { bookings: payload.data, error: null };
  } catch (error) {
    return {
      bookings: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchUserBooking(
  id: string | number,
  token: string,
): Promise<{ booking: Booking | null; error: string | null }> {
  try {
    const backendUrl = getBackendBaseUrl();
    const endpoint = new URL(`/api/user/bookings/${id}`, `${backendUrl}/`).toString();

    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return { booking: null, error: "Not found" };
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const payload = (await response.json()) as { data: Booking };
    return { booking: payload.data, error: null };
  } catch (error) {
    return {
      booking: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
