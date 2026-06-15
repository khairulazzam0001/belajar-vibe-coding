import { Elysia, t } from "elysia";
import { loginUser } from "../services/auth-services";

export const authRoutes = new Elysia({ prefix: "/api" }).post(
  "/login",
  async ({ body, set }) => {
    try {
      const result = await loginUser(body);
      if (!result.success) {
        set.status = 401;
        return { success: false, message: result.message };
      }
      set.status = 200;
      return { success: true, message: result.message, data: result.data };
    } catch (error: any) {
      console.error("Login error:", error);
      set.status = 500;
      return { success: false, message: "Terjadi kesalahan pada server" };
    }
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
      rememberMe: t.Optional(t.Boolean()),
    }),
  }
);
