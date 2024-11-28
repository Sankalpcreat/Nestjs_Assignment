import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { getConnection } from "typeorm";

describe("App E2E Tests", () => {
  let app: INestApplication;
  let accessToken: string;
  let dynamicQrId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  describe("Authentication Module", () => {
    it("/auth/register (POST) - should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      accessToken = response.body.access_token;
    });

    it("/auth/login (POST) - should login the user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "testuser",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      accessToken = response.body.access_token;
    });
  });

  describe("Users Module", () => {
    it("/auth/me (GET) - should get current user profile", async () => {
      const response = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", "testuser");
      userId = response.body.id;
    });
  });

  describe("QR Module", () => {
    it("/qr/static (POST) - should create a static QR code", async () => {
      const response = await request(app.getHttpServer())
        .post("/qr/static")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          url: "https://example.com",
        })
        .expect(201);

      expect(response.headers["content-type"]).toBe("image/png");
    });

    it("/qr/dynamic (POST) - should create a dynamic QR code", async () => {
      const response = await request(app.getHttpServer())
        .post("/qr/dynamic")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          url: "https://example.com/dynamic",
        })
        .expect(201);

      expect(response.headers["content-type"]).toBe("image/png");
      dynamicQrId = response.headers["x-dynamic-qr-id"];
      expect(dynamicQrId).toBeDefined();
    });

    it("/qr/:id/update (PUT) - should update the dynamic QR code URL", async () => {
      const response = await request(app.getHttpServer())
        .put(`/qr/${dynamicQrId}/update`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          url: "https://example.com/updated",
        })
        .expect(200);

      expect(response.body).toEqual("QR Code updated successfully");
    });
  });

  describe("Event Module", () => {
    it("/qr/:id/track (POST) - should track an event for a QR code", async () => {
      const response = await request(app.getHttpServer())
        .post(`/qr/${dynamicQrId}/track`)
        .send({
          location: "New York, USA",
          deviceType: "Mobile",
          userAgent: "Mozilla/5.0",
          ipAddress: "192.168.1.1",
        })
        .expect(201);

      expect(response.body).toEqual({ message: "Event tracking scheduled" });
    });

    it("/qr/:id/events (GET) - should retrieve events for a QR code", async () => {
      // Wait for the event to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .get(`/qr/${dynamicQrId}/events`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("Analytics Module", () => {
    it("/qr/:id/analytics (GET) - should retrieve analytics data for a QR code", async () => {
      const response = await request(app.getHttpServer())
        .get(`/qr/${dynamicQrId}/analytics`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("totalScans");
      expect(response.body).toHaveProperty("uniqueUsers");
    });
  });
});
