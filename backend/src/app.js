import express from "express";
import cors from "cors";
import relocationsRouter from "./routes/relocations.js";
import aiRouter from "./routes/ai.js";
import escalationsRouter from "./routes/escalations.js";
import analyticsRouter from "./routes/analytics.js";
import metaRouter from "./routes/meta.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
