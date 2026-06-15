import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api" }).post(
  "/users",
  async ({ body, set }) => {
    try {
      const newUser = await registerUser(body);
      set.status = 201;
      return {
        success: true,
        message: "Registrasi berhasil",
        data: newUser,
      };
    } catch (error: any) {
      if (error.message === "Email sudah terdaftar") {
        set.status = 400;
        return {
          success: false,
          message: error.message,
        };
      }
      
      // Log error internally for debugging
      console.error("Registration error:", error);
      
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan pada server",
      };
    }
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  }
);
