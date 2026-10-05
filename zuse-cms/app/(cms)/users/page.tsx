import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assignableRoles, atLeast, ROLES } from "@/lib/roles";
import { getMe, listUsers } from "@/lib/strapi";
import { UsersManager } from "./users-manager";

export const metadata: Metadata = { title: "Users" };

/** CMS accounts: Admins manage Editors, Super Admins manage everyone (enforced by Strapi). */
export default async function UsersPage() {
  const me = await getMe();
  if (!atLeast(me.role.type, "admin")) notFound();
  const accounts = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          {me.role.type === "super-admin"
            ? "Everyone who can sign in to this CMS."
            : "Everyone who can sign in to this CMS. As an Admin you can add and manage Editors."}
        </p>
      </div>
      <UsersManager
        accounts={accounts}
        me={{ id: me.id, role: me.role.type }}
        assignable={assignableRoles(me.role.type).map((role) => role.type)}
      />
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role.type} className="rounded-lg border p-4">
            <div className="font-medium">{role.name}</div>
            <p className="text-muted-foreground">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
