import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const FREE_READINGS_LIMIT = 3;

export async function checkUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  isPaid: boolean;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { allowed: false, remaining: 0, isPaid: false };
  }

  if (user.isPaid) {
    return { allowed: true, remaining: -1, isPaid: true }; // -1 means unlimited
  }

  const remaining = FREE_READINGS_LIMIT - (user.usageCount || 0);
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    isPaid: false,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      usageCount: (users.usageCount as any) + 1,
    })
    .where(eq(users.id, userId));
}

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}
