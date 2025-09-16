"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/logout";

export default function LogoutButton() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    try {
      await logout();
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      variant="secondary"
      className="hover:opacity-90"
    >
      {loading ? "Signing out…" : "Logout"}
    </Button>
  );
}
