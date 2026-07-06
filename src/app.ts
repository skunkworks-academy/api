import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { config } from "./config.js";
import { routes } from "./routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"]
    })
  );
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
  app.use(routes);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "validation_error", issues: error.issues });
    }

    if (error instanceof Error && error.message.startsWith("Origin not allowed by CORS")) {
      return res.status(403).json({ error: "cors_origin_denied", detail: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "internal_server_error" });
  };

  app.use(errorHandler);
  return app;
}

export const app = createApp();
