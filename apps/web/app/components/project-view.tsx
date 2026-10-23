"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  type ProjectDetails,
  type ProjectErrorSummary,
} from "../lib/api";

export function ProjectView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [errors, setErrors] = useState<ProjectErrorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [projectDetails, projectErrors] = await Promise.all([
        apiRequest<ProjectDetails>(`/api/v1/user/project/${projectId}`),
        apiRequest<ProjectErrorSummary[]>(
          `/api/v1/user/error/project/${projectId}`,
        ),
      ]);
      setProject(projectDetails);
      setErrors(projectErrors);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load this project.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  const unresolvedCount = errors.filter(
    (error) => error.state === "unresolved",
  ).length;
  const totalEvents = errors.reduce((sum, error) => sum + error.eventCount, 0);

  if (isLoading) {
    return <div className="page-loading">Loading project…</div>;
  }

  if (loadError || !project) {
    return (
      <div className="notice notice-error page-error" role="alert">
        <span>{loadError || "Project not found."}</span>
        <button
          type="button"
          className="button button-small button-secondary"
          onClick={() => void loadProject()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="back-link-wrap">
        <Link href="/dashboard" className="back-link">
          <span aria-hidden="true">←</span> All projects
        </Link>
      </div>
      <section className="page-heading project-heading">
        <div className="project-title-wrap">
          <span className="project-icon project-icon-0 project-title-icon">
            {project.projectName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <span className="eyebrow">PROJECT</span>
            <h1>{project.projectName}</h1>
            <p>Created {formatDate(project.createdAt)}</p>
          </div>
        </div>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => void loadProject()}
        >
          <RefreshIcon /> Refresh
        </button>
      </section>

      <section className="stats-grid project-stats">
        <article className="stat-card">
          <span className="stat-icon stat-icon-alert"><AlertIcon /></span>
          <div><p>Error groups</p><strong>{errors.length.toLocaleString()}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-warning"><OpenAlertIcon /></span>
          <div><p>Unresolved</p><strong>{unresolvedCount.toLocaleString()}</strong></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-pulse"><PulseIcon /></span>
          <div><p>Total events</p><strong>{totalEvents.toLocaleString()}</strong></div>
        </article>
      </section>

      <section className="errors-section">
        <div className="section-heading">
          <div>
            <h2>Error groups</h2>
            <p>Distinct errors received by this project, most recently seen first.</p>
          </div>
          <span className="count-pill">{errors.length}</span>
        </div>

        {errors.length === 0 ? (
          <div className="empty-state compact-empty">
            <span className="empty-icon"><PulseIcon /></span>
            <h3>No errors recorded</h3>
            <p>
              When your application reports errors with this project’s API key,
              they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="error-list">
            {errors.map((error) => (
              <Link
                key={error.id}
                className="error-row"
                href={`/dashboard/errors/${error.id}`}
              >
                <span
                  className={`error-indicator ${error.state === "resolved" ? "resolved" : ""}`}
                >
                  {error.state === "resolved" ? "✓" : "!"}
                </span>
                <span className="error-row-main">
                  <strong>{error.errorType}</strong>
                  <span>{error.message}</span>
                  <code>{error.filePath}</code>
                </span>
                <span className="error-row-meta">
                  <span className={`state-pill state-${error.state}`}>
                    {error.state}
                  </span>
                  <span>{error.eventCount.toLocaleString()} events</span>
                  <span>{formatRelativeTime(error.lastSeen)}</span>
                </span>
                <span className="row-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.6 9A7 7 0 0 1 18 6l2 1M4 17l2-1a7 7 0 0 0 12.4-3" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.3 4.4 2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </svg>
  );
}

function OpenAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v10m0 4h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}
