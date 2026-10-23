"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  apiRequest,
  type ErrorDetails,
  type ProjectDetails,
} from "../lib/api";

export function ErrorView({ errorId }: { errorId: string }) {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageError, setPageError] = useState("");

  const loadError = useCallback(async () => {
    setIsLoading(true);
    setPageError("");
    try {
      const errorDetails = await apiRequest<ErrorDetails>(
        `/api/v1/user/error/${errorId}`,
      );
      setError(errorDetails);
      const project = await apiRequest<ProjectDetails>(
        `/api/v1/user/project/${errorDetails.projectId}`,
      );
      setProjectName(project.projectName);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not load error details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [errorId]);

  useEffect(() => {
    void loadError();
  }, [loadError]);

  const toggleState = async () => {
    if (!error) return;
    setIsUpdating(true);
    setPageError("");
    try {
      const result = await apiRequest<{ state: ErrorDetails["state"] }>(
        "/api/v1/user/error/state",
        {
          method: "PATCH",
          body: JSON.stringify({ id: error.id }),
        },
      );
      setError({ ...error, state: result.state });
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Could not update error state.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="page-loading">Loading error details…</div>;
  }

  if (pageError || !error) {
    return (
      <div className="notice notice-error page-error" role="alert">
        <span>{pageError || "Error not found."}</span>
        <button
          type="button"
          className="button button-small button-secondary"
          onClick={() => void loadError()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="back-link-wrap">
        <Link href={`/dashboard/projects/${error.projectId}`} className="back-link">
          <span aria-hidden="true">←</span> {projectName || "Back to project"}
        </Link>
      </div>
      <section className="page-heading error-heading">
        <div>
          <span className="eyebrow">ERROR DETAILS</span>
          <h1>{error.errorType}</h1>
          <p>{error.message}</p>
        </div>
        <button
          type="button"
          className={`button ${error.state === "resolved" ? "button-secondary" : "button-primary"}`}
          disabled={isUpdating}
          onClick={() => void toggleState()}
        >
          {isUpdating
            ? "Updating…"
            : error.state === "resolved"
              ? "Mark unresolved"
              : "Mark resolved"}
        </button>
      </section>

      <div className="error-detail-layout">
        <section className="detail-card stack-card">
          <div className="detail-card-heading">
            <div>
              <h2>Stack trace</h2>
              <p>Captured from the most recent occurrence.</p>
            </div>
            <span className={`state-pill state-${error.state}`}>{error.state}</span>
          </div>
          <pre className="stack-trace"><code>{error.stack || "No stack trace was recorded."}</code></pre>
        </section>

        <aside className="detail-card">
          <h2>Event information</h2>
          <dl className="detail-list">
            <Detail label="Events" value={error.eventCount.toLocaleString()} />
            <Detail label="Environment" value={error.environment} />
            <Detail label="First seen" value={formatDate(error.firstSeen)} />
            <Detail label="Last seen" value={formatDate(error.lastSeen)} />
            <Detail label="Source file" value={error.filePath} mono />
          </dl>
        </aside>

        <aside className="detail-card">
          <h2>Request & device</h2>
          <dl className="detail-list">
            <Detail label="Request" value={formatRequest(error.reqMethod, error.reqPath)} />
            <Detail label="Operating system" value={error.userOs || error.device} />
            <Detail label="Browser" value={error.userBrowser || "Not available"} />
            <Detail label="Platform" value={`${error.platform} ${error.platformVersion}`} />
            <Detail label="Device" value={`${error.device} ${error.deviceVersion}`} />
          </dl>
        </aside>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd className={mono ? "mono-value" : ""}>{value || "Not available"}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRequest(method: string | null, path: string | null) {
  if (!method && !path) return "Not available";
  return [method, path].filter(Boolean).join(" ");
}
