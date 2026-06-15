import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db/connection";
import { users } from "./db/schema";
import { sql } from "drizzle-orm";

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
  .get("/users", async () => {
    try {
      const data = await db.select().from(users);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch users",
      };
    }
  })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const { name, email } = body;
        await db.insert(users).values({ name, email });
        set.status = 201;
        return {
          success: true,
          message: "User created successfully",
          data: { name, email },
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          error: error.message || "Failed to create user",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  )
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
