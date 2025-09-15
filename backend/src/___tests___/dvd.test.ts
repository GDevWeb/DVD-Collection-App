import dotenv from "dotenv";
import mongoose from "mongoose";
import request from "supertest";
import DVD from "../models/dvd.model";

// Charger les variables d'environnement de test
dotenv.config({ path: ".env.test" });

// Importer l'app sans démarrer le serveur
let app: any;

beforeAll(async () => {
  // Vérifier que l'URI de test est définie
  if (!process.env.MONGODB_URI_TEST) {
    throw new Error("MONGODB_URI_TEST environment variable is not defined");
  }

  // Se connecter à la base de données de test
  await mongoose.connect(process.env.MONGODB_URI_TEST);

  // Importer l'app après la connexion à la DB
  const serverModule = await import("../server");
  app = serverModule.default;
});

afterAll(async () => {
  // Nettoyer la base de données de test
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Nettoyer les collections avant chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("DVD API Endpoints", () => {
  // Test pour POST /api/dvds/scan
  describe("POST /api/dvds/scan", () => {
    it("should return a list of movies for a valid EAN code", async () => {
      const res = await request(app)
        .post("/api/dvds/scan")
        .send({ eanCode: "3459370470833" }); // Example EAN for "Hercules"

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("length");
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("tmdbId");
      expect(res.body[0]).toHaveProperty("title");
    });

    it("should return a 404 for an invalid EAN code", async () => {
      const res = await request(app)
        .post("/api/dvds/scan")
        .send({ eanCode: "1234567890123" });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message");
    });
  });

  // Test pour POST /api/dvds/add
  describe("POST /api/dvds/add", () => {
    it("should add a DVD from a valid TMDb ID", async () => {
      const res = await request(app)
        .post("/api/dvds/add")
        .send({ tmdbId: 284054, eanCode: "1234567890123" }); // "Black Panther" TMDb ID

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toEqual("Black Panther");
    });

    it("should return 409 if a DVD with the EAN code already exists", async () => {
      // Créer d'abord un DVD
      await request(app)
        .post("/api/dvds/add")
        .send({ tmdbId: 284054, eanCode: "1234567890124" });

      // Essayer d'en créer un autre avec le même EAN
      const res = await request(app)
        .post("/api/dvds/add")
        .send({ tmdbId: 284054, eanCode: "1234567890124" });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty(
        "message",
        "A DVD with this EAN code already exists."
      );
    });
  });

  // Test pour POST /api/dvds/manual
  describe("POST /api/dvds/manual", () => {
    it("should add a DVD with manual data", async () => {
      const res = await request(app).post("/api/dvds/manual").send({
        eanCode: "0987654321098",
        title: "Manual Movie",
        director: "John Doe",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual("Manual Movie");
    });
  });

  // Test pour GET /api/dvds
  describe("GET /api/dvds", () => {
    it("should return an array of all DVDs", async () => {
      // Créer quelques DVDs de test
      await new DVD({ eanCode: "test1", title: "Test A" }).save();
      await new DVD({ eanCode: "test2", title: "Test B" }).save();

      const res = await request(app).get("/api/dvds");

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  // Test pour GET /api/dvds/:id
  describe("GET /api/dvds/:id", () => {
    it("should return a single DVD by ID", async () => {
      const dvd = await new DVD({ eanCode: "test3", title: "Test C" }).save();

      const res = await request(app).get(`/api/dvds/${dvd._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual("Test C");
    });

    it("should return a 404 for a nonexistent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/dvds/${fakeId}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  // Test pour DELETE /api/dvds/:id
  describe("DELETE /api/dvds/:id", () => {
    it("should delete a DVD by ID", async () => {
      const dvd = await new DVD({ eanCode: "test4", title: "Test D" }).save();

      const res = await request(app).delete(`/api/dvds/${dvd._id}`);

      expect(res.statusCode).toEqual(200);

      // Vérifier que le DVD a été supprimé
      const deletedDvd = await DVD.findById(dvd._id);
      expect(deletedDvd).toBeNull();
    });

    it("should return a 404 for a nonexistent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/dvds/${fakeId}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
