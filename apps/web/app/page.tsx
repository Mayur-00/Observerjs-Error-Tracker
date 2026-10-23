"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./lib/auth.client";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      router.replace(session ? "/dashboard" : "/login");
    }
  }, [isPending, router, session]);

  return (
    <main className="screen-loading">
      <span className="loading-mark">O</span>
      <p>Preparing your workspace…</p>
    </main>
  );
}
