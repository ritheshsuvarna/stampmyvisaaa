import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import relocationsRouter from "./routes/relocations.js";
import aiRouter from "./routes/ai.js";
import escalationsRouter from "./routes/escalations.js";
import analyticsRouter from "./routes/analytics.js";
import metaRouter from "./routes/meta.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ../.. from src/ -> backend/ -> repo root -> frontend/dist. Only present
// when the frontend has been built (e.g. by a single-service deploy build
// step); absent in local dev where the frontend runs its own Vite server.
const FRONTEND_DIST = path.resolve(__dirname, "../../frontend/dist");

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/relocations", relocationsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/escalations", escalationsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/meta", metaRouter);

  // Unmatched /api/* routes are a real 404. Anything else falls through to
  // the static frontend below (if built) so both live on one origin/port.
  app.use("/api", notFoundHandler);

  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get("*", (req, res) => res.sendFile(path.join(FRONTEND_DIST, "index.html")));
  }

  app.use(errorHandler);

  return app;
}
