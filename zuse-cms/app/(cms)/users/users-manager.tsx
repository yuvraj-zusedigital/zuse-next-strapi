"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { roleName, type RoleType } from "@/lib/roles";
import type { CmsAccount } from "@/lib/types";
import { addUser, changeRole, resetPassword, setBlocked, type UserActionResult } from "./actions";

const MIN_PASSWORD = 8;
const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" });

/** 16 random characters, for new accounts and resets. */
function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
}

function RoleSelect({ value, roles, onChange, disabled, id }: { value: string; roles: RoleType[]; onChange: (role: RoleType) => void; disabled?: boolean; id?: string }) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as RoleType)} disabled={disabled}>
      <SelectTrigger id={id} className="w-40" aria-label="Role">
        <SelectValue>{(current: string) => roleName(current)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleName(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PasswordField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-2">
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="new-password" className="font-mono" />
      <Button type="button" variant="outline" onClick={() => onChange(generatePassword())} title="Generate a password">
        <RefreshCw /> Generate
      </Button>
    </div>
  );
}

/** Add-account dialog. The password is shown so it can be shared with the new user securely. */
function AddUserDialog({ roles, onClose }: { roles: RoleType[]; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleType>(roles[0]);
  const [password, setPassword] = useState(generatePassword);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    startTransition(async () => {
      const result = await addUser({ email, password, role });
      if (!result.ok) return setError(result.message);
      toast.success(`Added ${email} as ${roleName(role)}. Share the password with them securely.`);
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>They sign in with this email and password, and can&apos;t change the password themselves yet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input id="new-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" />
          </div>
          {roles.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <RoleSelect id="new-role" value={role} roles={roles} onChange={setRole} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">They&apos;ll be added as {roleName(role)}.</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <PasswordField id="new-password" value={password} onChange={setPassword} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Add user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ account, onClose }: { account: CmsAccount; onClose: () => void }) {
  const [password, setPassword] = useState(generatePassword);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    startTransition(async () => {
      const result = await resetPassword(account.id, password);
      if (!result.ok) return setError(result.message);
      toast.success(`Password changed for ${account.email}.`);
      onClose();
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Set a new password</DialogTitle>
            <DialogDescription>For {account.email}. Share it with them securely.</DialogDescription>
          </DialogHeader>
          <PasswordField id="reset-password" value={password} onChange={setPassword} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Set password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersManager({ accounts, me, assignable }: { accounts: CmsAccount[]; me: { id: number; role: string }; assignable: RoleType[] }) {
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<CmsAccount | null>(null);
  const [pending, startTransition] = useTransition();

  const act = (request: () => Promise<UserActionResult>, success: string) =>
    startTransition(async () => {
      const result = await request();
      if (result.ok) toast.success(success);
      else toast.error(result.message);
    });

  // Mirrors Strapi's rules, to show only the controls that will work.
  const canManage = (account: CmsAccount) => account.id !== me.id && Boolean(account.role && assignable.includes(account.role.type as RoleType));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)}>
          <Plus /> Add user
        </Button>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const self = account.id === me.id;
              const manageable = canManage(account);
              return (
                <TableRow key={account.id} className={account.blocked ? "text-muted-foreground" : undefined}>
                  <TableCell className="font-medium">
                    {account.email} {self && <Badge variant="secondary">You</Badge>}
                  </TableCell>
                  <TableCell>
                    {manageable && assignable.length > 1 ? (
                      <RoleSelect
                        value={account.role?.type ?? "editor"}
                        roles={assignable}
                        disabled={pending}
                        onChange={(role) => act(() => changeRole(account.id, role), `${account.email} is now ${roleName(role)}.`)}
                      />
                    ) : (
                      roleName(account.role?.type)
                    )}
                  </TableCell>
                  <TableCell>{account.blocked ? <Badge variant="outline">Deactivated</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
                  <TableCell className="hidden lg:table-cell">{dateFormat.format(new Date(account.createdAt))}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {(manageable || self) && (
                        <Button variant="outline" size="sm" onClick={() => setResetting(account)} disabled={pending}>
                          <KeyRound /> {self ? "Change password" : "Reset password"}
                        </Button>
                      )}
                      {manageable &&
                        (account.blocked ? (
                          <Button variant="outline" size="sm" disabled={pending} onClick={() => act(() => setBlocked(account.id, false), `${account.email} can sign in again.`)}>
                            Activate
                          </Button>
                        ) : (
                          <ConfirmButton
                            title={`Deactivate ${account.email}?`}
                            description="They're signed out right away and can't sign in until someone activates the account again. Their past changes stay in the activity log."
                            confirmLabel="Deactivate"
                            destructive
                            variant="outline"
                            size="sm"
                            disabled={pending}
                            onConfirm={() => act(() => setBlocked(account.id, true), `${account.email} was deactivated.`)}
                          >
                            Deactivate
                          </ConfirmButton>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {adding && <AddUserDialog roles={assignable} onClose={() => setAdding(false)} />}
      {resetting && <ResetPasswordDialog account={resetting} onClose={() => setResetting(null)} />}
    </div>
  );
}
