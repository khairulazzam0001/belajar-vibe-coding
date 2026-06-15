import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  // 1. Pengecekan Email
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, payload.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hashing Password
  const hashedPassword = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Insert Database
  const [result] = await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  // 4. Ambil data user yang baru dibuat
  const insertedId = result.insertId;
  const [newUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, insertedId))
    .limit(1);

  if (!newUser) {
    throw new Error("Gagal mengambil data user yang baru dibuat");
  }

  // 5. Return (tanpa password)
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}
