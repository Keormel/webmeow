import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { AxiosRequestConfig } from "axios";

type CapturedRequest = {
  config: AxiosRequestConfig;
  resolve: (value: { data: unknown }) => void;
  reject: (error: unknown) => void;
};

const axiosMock = vi.hoisted(() => {
  const requests: CapturedRequest[] = [];
  const request = vi.fn(
    (config: AxiosRequestConfig) =>
      new Promise<{ data: unknown }>((resolve, reject) => {
        requests.push({ config, resolve, reject });
      })
  );

  return { request, requests };
});

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      request: axiosMock.request,
      getUri: (config: AxiosRequestConfig) =>
        `${config.method ?? "GET"} ${config.url ?? ""}`,
    })),
  },
  isAxiosError: () => false,
}));

import { api } from "@/lib/api-client";

describe("api client GET coalescing", () => {
  afterEach(() => {
    axiosMock.request.mockClear();
    axiosMock.requests.length = 0;
  });

  it("shares one backend request across concurrent matching URLs", async () => {
    const schema = z.object({ rooms: z.number() });

    const first = api.hotel.get(schema, "/rooms");
    const second = api.hotel.get(schema, "/rooms");

    expect(axiosMock.request).toHaveBeenCalledTimes(1);

    axiosMock.requests[0]?.resolve({ data: { rooms: 7 } });

    const results = await Promise.all([first, second]);

    expect(results).toEqual([{ rooms: 7 }, { rooms: 7 }]);
    expect(results[0]).toBe(results[1]);
  });

  it("keeps different URLs independent while one URL is in flight", async () => {
    const schema = z.object({ id: z.string() });

    const first = api.hotel.get(schema, "/reservation/by-guest/guest-a");
    const second = api.hotel.get(schema, "/reservation/by-guest/guest-b");

    expect(axiosMock.request).toHaveBeenCalledTimes(2);

    axiosMock.requests[1]?.resolve({ data: { id: "guest-b" } });
    await expect(second).resolves.toEqual({ id: "guest-b" });

    axiosMock.requests[0]?.resolve({ data: { id: "guest-a" } });
    await expect(first).resolves.toEqual({ id: "guest-a" });
  });

  it("clears failed in-flight requests so the URL can be retried", async () => {
    const schema = z.object({ rooms: z.number() });

    const first = api.hotel.get(schema, "/rooms");
    const second = api.hotel.get(schema, "/rooms");

    expect(axiosMock.request).toHaveBeenCalledTimes(1);

    axiosMock.requests[0]?.reject(new Error("network failed"));

    await expect(first).rejects.toThrow("network failed");
    await expect(second).rejects.toThrow("network failed");

    const retry = api.hotel.get(schema, "/rooms");

    expect(axiosMock.request).toHaveBeenCalledTimes(2);

    axiosMock.requests[1]?.resolve({ data: { rooms: 3 } });
    await expect(retry).resolves.toEqual({ rooms: 3 });
  });
});
