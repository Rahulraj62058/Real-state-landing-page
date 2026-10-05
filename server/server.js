import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import favoriteRoutes from "./routes/favorites.js";
import inquiryRoutes from "./routes/inquiries.js";
import adminRoutes from "./routes/admin.js";
import { seedDatabase } from "./seedData.js";

dotenv.config();
process.env.JWT_SECRET ||= "dev-secret-change-me-in-production";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// ---- API ----
app.get("/api/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", (_req, res) => res.status(404).json({ message: "Route not found" }));

// ---- Website (same server, same port) ----
if (isProd) {
  const dist = path.join(root, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  if (err.code === 11000) return res.status(409).json({ message: "That email is already registered" });
  res.status(500).json({ message: err.message || "Something went wrong on the server" });
});

// ---- Database (connects in the background so the site opens immediately) ----
async function connectDb() {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
      console.log("Connected to MongoDB");
      return;
    } catch (e) {
      console.warn("Could not reach MongoDB at MONGO_URI (" + e.message + ").");
    }
  }
  console.log("Starting a temporary in-memory MongoDB (first run downloads it, data resets on restart)...");
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  await seedDatabase();
}

app.listen(PORT, () => {
  console.log("Real Estate Portal running at http://localhost:" + PORT);
  connectDb().then(() => console.log("Database ready")).catch((e) => console.error("Database setup failed:", e.message));
});
