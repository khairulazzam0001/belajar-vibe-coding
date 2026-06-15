import { db } from "../db/connection";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

// Payload type for login
export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Verify user credentials and optionally create a session token for remember‑me.
 * Returns an object containing success flag, optional token and user data.
 */
export async function loginUser(payload: LoginPayload) {
  const { email, password, rememberMe = false } = payload;

  // Find user by email
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || user.length === 0) {
    return { success: false, message: "Invalid email or password" };
  }
  const found = user[0];

  // Verify password using Bun's native bcrypt implementation
  const isValid = await Bun.password.verify(password, found.password);
  if (!isValid) {
    return { success: false, message: "Invalid email or password" };
  }

  // If rememberMe is requested, generate a UUID token and store in sessions table
  if (rememberMe) {
    const token = crypto.randomUUID();
    await db
      .insert(sessions)
      .values({
        userId: found.id,
        token,
        // createdAt and updatedAt are handled by defaults in schema
      });
    return {
      success: true,
      message: "Login successful",
      data: {
        id: found.id,
        name: found.name,
        email: found.email,
        token,
      },
    };
  }

  // Normal login without token
  return {
    success: true,
    message: "Login successful",
    data: {
      id: found.id,
      name: found.name,
      email: found.email,
    },
  };
}
