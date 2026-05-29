import { afterEach, describe, expect, test } from "bun:test";

import { getBackendBaseUrl } from "./backend";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env.BACKEND_URL = originalEnv.BACKEND_URL;
  process.env.NODE_ENV = originalEnv.NODE_ENV;
});

describe("getBackendBaseUrl", () => {
  test("returns URL with trailing slash stripped", () => {
    process.env.BACKEND_URL = "http://localhost:8000/";
    expect(getBackendBaseUrl()).toBe("http://localhost:8000");
  });

  test("returns URL unchanged when no trailing slash", () => {
    process.env.BACKEND_URL = "http://127.0.0.1:8000";
    expect(getBackendBaseUrl()).toBe("http://127.0.0.1:8000");
  });

  test("throws when BACKEND_URL is not set", () => {
    delete process.env.BACKEND_URL;
    expect(() => getBackendBaseUrl()).toThrow("BACKEND_URL must be configured");
  });

  test("throws when production URL uses plain HTTP", () => {
    process.env.BACKEND_URL = "http://api.example.com";
    process.env.NODE_ENV = "production";
    expect(() => getBackendBaseUrl()).toThrow(
      "Production backend URL must use HTTPS",
    );
  });

  test("accepts HTTPS for remote hosts", () => {
    process.env.BACKEND_URL = "https://api.example.com";
    expect(getBackendBaseUrl()).toBe("https://api.example.com");
  });
});
