"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import type { ValidationError } from "@/types/validate";

export default function LoginForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | string[] | null>(null);
  const [success, setSuccess] = React.useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        if (Array.isArray(body.error) && body.error.length > 0) {
          const messages = (body.error as ValidationError[]).map(
            (err) => `${err.path}: ${err.message}`
          );
          setError(messages);
        } else {
          setError(body.error || "Login failed");
        }

        return;
      }

      const data = await res.json();
      const expires = new Date(data.expiresAt * 1000).toUTCString();
      document.cookie = `accessToken=${data.accessToken}; Path=/; Expires=${expires}; SameSite=Strict`;

      setSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || success;

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>
            {Array.isArray(error)
              ? error.map((msg, i) => <p key={i}>{msg}</p>)
              : error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Redirecting to dashboard…</AlertDescription>
        </Alert>
      )}

      {/* Username */}
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yourname"
          required
          disabled={disabled}
        />
      </div>

      {/* Password */}
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={disabled}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        {disabled ? (
          <span className="text-gray-400 cursor-not-allowed underline">
            Register
          </span>
        ) : (
          <Link href="/auth/register" className="text-primary underline">
            Register
          </Link>
        )}
      </p>
    </form>
  );
}
