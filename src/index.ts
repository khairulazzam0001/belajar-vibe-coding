import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db/connection";
import { sql } from "drizzle-orm";
import { userRoutes } from "./routes/user-routes";

const port = process.env.PORT || 3000;

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "API Dokumentasi untuk Backend Elysia, Drizzle, dan MySQL",
        },
      },
    })
  )
  .use(userRoutes)
  .get("/", () => {
    return {
      message: "Welcome to Belajar Vibe Coding Backend API!",
      docs: "/swagger",
      health: "/health",
    };
  })
  .get("/health", async () => {
    try {
      // Test database connection
      await db.execute(sql`SELECT 1`);
      return {
        status: "UP",
        database: "CONNECTED",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "DOWN",
        database: "DISCONNECTED",
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  })
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
