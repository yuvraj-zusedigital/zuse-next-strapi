import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Backdrop } from "@/components/backdrop";
import { DigitalClock } from "@/components/clock";
import { ThemeToggle } from "@/components/theme";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, expired } = await searchParams;

  return (
    <main className="relative flex min-h-svh items-center justify-center p-4">
      <Backdrop />
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center justify-end gap-2">
        <DigitalClock timezone={null} editable={false} />
        <ThemeToggle className="cms-glass rounded-full py-1 pr-1 pl-3.5 ring-1 ring-border" />
      </div>
      <Card className="cms-glass cms-rise relative z-10 w-full max-w-sm rounded-2xl ring-white/70 dark:ring-white/10">
        <CardHeader className="justify-items-center gap-3 pt-2 text-center">
          <Image src="/zuse-logo.png" alt="Zuse Digital" width={684} height={138} priority className="h-auto w-44 dark:brightness-0 dark:invert" />
          <div className="space-y-1">
            <CardTitle className="text-base">
              <span className="cms-gradient-text">Content management</span>
            </CardTitle>
            <CardDescription>Sign in with your CMS account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm
            next={typeof next === "string" ? next : undefined}
            notice={expired ? "Your session ended. Sign in again." : undefined}
          />
        </CardContent>
      </Card>
    </main>
  );
}
