import { ZodError } from "zod";
import { AiNotConfiguredError, AiParseError } from "../services/aiService.js";

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code ?? "error";
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: "Not found", code: "not_found" } });
}

// Centralized so every route can just `throw` — no per-route try/catch
// duplication, and every failure mode returns the same JSON shape.
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: err.issues[0]?.message ?? "Invalid request",
        code: "validation_error",
        issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    });
  }

  if (err instanceof AiNotConfiguredError) {
    return res.status(503).json({ error: { message: err.message, code: "ai_not_configured" } });
  }

  if (err instanceof AiParseError) {
    return res.status(502).json({ error: { message: err.message, code: "ai_parse_error" } });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({ error: { message: "Record not found", code: "not_found" } });
  }

  console.error(err);
  res.status(500).json({ error: { message: "Something went wrong on our end.", code: "internal_error" } });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
