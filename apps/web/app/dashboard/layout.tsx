"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient, useSession } from "../lib/auth.client";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, router, session]);

  if (isPending || !session) {
    return (
      <main className="screen-loading">
        <span className="loading-mark">O</span>
        <p>{isPending ? "Loading your workspace…" : "Taking you to sign in…"}</p>
      </main>
    );
  }

  const user = session.user;
  const initials =
    user.name
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.email[0]?.toUpperCase() || "U";

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" href="/dashboard">
          <span className="brand-symbol">O</span>
          <span>observer</span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <Link
            className={`side-link ${pathname === "/dashboard" ? "active" : ""}`}
            href="/dashboard"
          >
            <GridIcon />
            <span>Projects</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            API connected
          </div>
          <div className="user-card">
            <span className="avatar">{initials}</span>
            <span className="user-meta">
              <strong>{user.name || "Observer user"}</strong>
              <small>{user.email}</small>
            </span>
            <button
              className="icon-button signout-button"
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={async () => {
                await authClient.signOut();
                router.replace("/login");
              }}
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {pathname === "/dashboard"
                ? "Projects"
                : pathname.includes("/errors/")
                  ? "Error details"
                  : "Project"}
            </strong>
          </div>
          <span className="topbar-badge">
            <span className="status-dot" />
            All systems operational
          </span>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 17l5-5-5-5M15 12H3m9-8h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}
