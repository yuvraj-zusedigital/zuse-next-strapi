"use server";

import { revalidatePath } from "next/cache";
import type { RoleType } from "@/lib/roles";
import { createUser, StrapiError, updateUser } from "@/lib/strapi";

export type UserActionResult = { ok: true } | { ok: false; message: string };

/** Strapi decides who may do what; its message is shown as-is. */
async function run(request: () => Promise<unknown>): Promise<UserActionResult> {
  try {
    await request();
    revalidatePath("/users");
    return { ok: true };
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function addUser(data: { email: string; password: string; role: RoleType }) {
  return run(() => createUser(data));
}

export async function changeRole(id: number, role: RoleType) {
  return run(() => updateUser(id, { role }));
}

export async function setBlocked(id: number, blocked: boolean) {
  return run(() => updateUser(id, { blocked }));
}

export async function resetPassword(id: number, password: string) {
  return run(() => updateUser(id, { password }));
}
