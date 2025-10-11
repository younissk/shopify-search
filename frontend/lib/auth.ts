import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}
