"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "../lib/auth.client";

interface AuthValues {
  name?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [authError, setAuthError] = useState("");
  const isSignup = mode === "signup";
  const { register, handleSubmit, formState } = useForm<AuthValues>();

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setAuthError("");
    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: name ?? "",
            email,
            password,
            callbackURL: `${window.location.origin}/dashboard`,
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: `${window.location.origin}/dashboard`,
          });

      if (result.error) {
        setAuthError(result.error.message || "Unable to authenticate.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the authentication service.",
      );
    }
  });

  const signInWithGoogle = async () => {
    setAuthError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (result.error) {
        setAuthError(result.error.message || "Google sign-in failed.");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in.",
      );
    }
  };

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-symbol">O</span>
        <span>observer</span>
      </Link>
      <section className="auth-card">
        <div className="auth-heading">
          <span className="eyebrow">ERROR OBSERVABILITY</span>
          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p>
            {isSignup
              ? "Start keeping an eye on the errors that matter."
              : "Sign in to see what’s happening in your projects."}
          </p>
        </div>

        <button
          className="button button-secondary google-button"
          type="button"
          onClick={signInWithGoogle}
        >
          <GoogleMark />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or with email</span></div>

        <form className="form-stack" onSubmit={onSubmit} noValidate>
          {isSignup && (
            <label className="field">
              <span>Your name</span>
              <input
                autoComplete="name"
                placeholder="Alex Morgan"
                {...register("name", {
                  required: "Enter your name.",
                  minLength: { value: 2, message: "Name is too short." },
                })}
              />
              {formState.errors.name && (
                <small className="field-error">
                  {formState.errors.name.message}
                </small>
              )}
            </label>
          )}

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register("email", {
                required: "Enter your email address.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {formState.errors.email && (
              <small className="field-error">
                {formState.errors.email.message}
              </small>
            )}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              {...register("password", {
                required: "Enter your password.",
                minLength: isSignup
                  ? { value: 8, message: "Use at least 8 characters." }
                  : undefined,
              })}
            />
            {formState.errors.password && (
              <small className="field-error">
                {formState.errors.password.message}
              </small>
            )}
          </label>

          {authError && (
            <div className="notice notice-error" role="alert">
              {authError}
            </div>
          )}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting
              ? "Please wait…"
              : isSignup
                ? "Create account"
                : "Sign in"}
            {!formState.isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Observer?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </section>
      <p className="auth-footer">A clearer view of what’s going wrong.</p>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="google-mark">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 0 1-2 3.02v2.47h3.23c1.9-1.75 2.98-4.33 2.98-7.28Z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.97-.9 6.62-2.49l-3.23-2.47c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.08v2.55A10 10 0 0 0 10 20Z"
      />
      <path
        fill="#FBBC05"
        d="M4.41 11.88a6.02 6.02 0 0 1 0-3.76V5.57H1.08a10 10 0 0 0 0 8.86l3.33-2.55Z"
      />
      <path
        fill="#EA4335"
        d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.86-2.87C14.96.99 12.7 0 10 0a10 10 0 0 0-8.92 5.57l3.33 2.55C5.2 5.72 7.4 3.96 10 3.96Z"
      />
    </svg>
  );
}
