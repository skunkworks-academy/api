import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("health and public catalogue routes", () => {
  it("returns health metadata", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body.service).toBe("skunkworks-academy-api");
    expect(response.body.allowedOrigins).toContain("https://portal.skunkworksacademy.com");
  });

  it("returns public jobs", async () => {
    const response = await request(app).get("/api/jobs").expect(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.every((job: { status: string }) => job.status === "Live")).toBe(true);
  });

  it("requires authentication for protected routes", async () => {
    await request(app).get("/api/me/profile").expect(401);
  });
});
