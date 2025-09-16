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

export default function RegisterForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | string[] | null>(null);
  const [success, setSuccess] = React.useState(false);

  const router = useRouter();
  const disabled = loading || success;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/register",
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
          setError(body.error || "Registration failed");
        }
        return;
      }

      await res.json().catch(() => ({}));
      setSuccess(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Registration failed</AlertTitle>
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
          <AlertDescription>
            Account created. Redirecting to login…
          </AlertDescription>
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
          placeholder="choose username"
          autoComplete="username"
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
          autoComplete="new-password"
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
        {loading ? "Creating…" : "Sign up"}
      </Button>

      {/* Footer link */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        {disabled ? (
          <span className="text-gray-400 cursor-not-allowed underline">
            Log in
          </span>
        ) : (
          <Link href="/auth/login" className="text-primary underline">
            Log in
          </Link>
        )}
      </p>
    </form>
  );
}
