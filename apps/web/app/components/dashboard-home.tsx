"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  apiRequest,
  type ProjectSummary,
} from "../lib/api";

interface NewProjectValues {
  name: string;
}

interface CreateProjectResult {
  apikey: string;
  endpoint?: string;
}

export function DashboardHome() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdKey, setCreatedKey] = useState("");
  const [createError, setCreateError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewProjectValues>();

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await apiRequest<ProjectSummary[]>(
        "/api/v1/user/project/all",
      );
      setProjects(result);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load projects.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const createProject = handleSubmit(async ({ name }) => {
    setCreateError("");
    setCreatedKey("");
    try {
      const result = await apiRequest<CreateProjectResult>(
        "/api/v1/user/project",
        {
          method: "POST",
          body: JSON.stringify({ name }),
        },
      );
      setCreatedKey(result.apikey);
      reset();
      setShowCreateForm(false);
      await loadProjects();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Could not create project.",
      );
    }
  });

  const totalErrors = projects.reduce(
    (total, project) => total + Number(project.totalErrorRows || 0),
    0,
  );
  const totalEvents = projects.reduce(
    (total, project) => total + Number(project.totalEventCount || 0),
    0,
  );

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Your projects</h1>
          <p>Monitor errors and activity across your applications.</p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setShowCreateForm((open) => !open);
            setCreateError("");
          }}
        >
          <span className="plus-mark">+</span> New project
        </button>
      </section>

      {createdKey && (
        <section className="notice notice-success key-notice">
          <div>
            <strong>Project created. Copy your API key now.</strong>
            <p>This key is only shown once.</p>
            <code>{createdKey}</code>
          </div>
          <button
            type="button"
            className="button button-small button-secondary"
            onClick={() => void navigator.clipboard.writeText(createdKey)}
          >
            Copy key
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            className="notice-dismiss"
            onClick={() => setCreatedKey("")}
          >
            ×
          </button>
        </section>
      )}

      {showCreateForm && (
        <section className="create-panel">
          <div className="create-panel-heading">
            <div>
              <h2>Start a new project</h2>
              <p>Give your application a name to create its workspace.</p>
            </div>
            <button
              type="button"
              className="icon-button close-button"
              aria-label="Close"
              onClick={() => setShowCreateForm(false)}
            >
              ×
            </button>
          </div>
          <form className="create-project-form" onSubmit={createProject}>
            <label className="field">
              <span>Project name</span>
              <input
                autoFocus
                placeholder="e.g. Customer portal"
                maxLength={15}
                {...register("name", {
                  required: "Enter a project name.",
                  maxLength: {
                    value: 15,
                    message: "Project names can be up to 15 characters.",
                  },
                })}
              />
              {errors.name && (
                <small className="field-error">{errors.name.message}</small>
              )}
            </label>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create project"}
            </button>
          </form>
          {createError && (
            <div className="notice notice-error" role="alert">
              {createError}
            </div>
          )}
        </section>
      )}

      {loadError && (
        <div className="notice notice-error load-notice" role="alert">
          <span>{loadError}</span>
          <button
            className="button button-small button-secondary"
            type="button"
            onClick={() => void loadProjects()}
          >
            Try again
          </button>
        </div>
      )}

      <section className="stats-grid" aria-label="Workspace statistics">
        <StatCard label="Total projects" value={projects.length} icon="layers" />
        <StatCard label="Error groups" value={totalErrors} icon="alert" />
        <StatCard label="Events recorded" value={totalEvents} icon="pulse" />
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <h2>All projects</h2>
            <p>Your applications connected to Observer.</p>
          </div>
          <span className="count-pill">{projects.length}</span>
        </div>

        {isLoading ? (
          <div className="project-grid" aria-label="Loading projects">
            {[1, 2, 3].map((item) => (
              <div className="project-card skeleton-card" key={item}>
                <span className="skeleton-line skeleton-icon" />
                <span className="skeleton-line skeleton-title" />
                <span className="skeleton-line skeleton-copy" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><LayersIcon /></span>
            <h3>No projects yet</h3>
            <p>
              Create your first project to connect an application and start
              collecting errors.
            </p>
            {!showCreateForm && (
              <button
                type="button"
                className="button button-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project, index) => (
              <Link
                className="project-card"
                href={`/dashboard/projects/${project.projectId}`}
                key={project.projectId}
              >
                <div className="project-card-top">
                  <span className={`project-icon project-icon-${index % 4}`}>
                    {project.projectName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="card-arrow" aria-hidden="true">↗</span>
                </div>
                <h3>{project.projectName}</h3>
                <p className="project-created">
                  Created {formatDate(project.createdAt)}
                </p>
                <div className="project-card-metrics">
                  <div>
                    <strong>{Number(project.totalErrorRows || 0)}</strong>
                    <span>error groups</span>
                  </div>
                  <div>
                    <strong>{formatCount(project.totalEventCount)}</strong>
                    <span>events</span>
                  </div>
                </div>
                <div className="project-card-footer">
                  <span><span className="status-dot" /> Collecting data</span>
                  <span>Open project <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: "layers" | "alert" | "pulse";
}) {
  return (
    <article className="stat-card">
      <span className={`stat-icon stat-icon-${icon}`}>
        {icon === "layers" ? <LayersIcon /> : icon === "alert" ? <AlertIcon /> : <PulseIcon />}
      </span>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCount(value: number | string | null) {
  return Number(value || 0).toLocaleString();
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
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

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}
