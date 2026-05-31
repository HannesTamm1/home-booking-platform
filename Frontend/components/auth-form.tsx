"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  redirectTo?: string;
};

type ErrorState = Record<string, string[]>;

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ErrorState>({});
  const [generalError, setGeneralError] = useState("");

  const isLogin = mode === "login";

  function handleSubmit(formData: FormData) {
    setErrors({});
    setGeneralError("");

    startTransition(async () => {
      const payload = isLogin
        ? {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            password_confirmation: String(formData.get("password_confirmation") ?? ""),
          };

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
        errors?: ErrorState;
      };

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setGeneralError(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(redirectTo ?? "/");
      router.refresh();
    });
  }

  function fieldError(name: string) {
    return errors[name]?.[0] ?? null;
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
          {isLogin ? "Welcome back" : "Create an account"}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {isLogin ? "Log in to continue" : "Register to start booking"}
        </h1>
        <p className="text-sm leading-6 text-neutral-500">
          {isLogin
            ? "Use your email and password to sign in."
            : "Keep it simple with the essentials, similar to Airbnb's clean auth flow."}
        </p>
      </div>

      <form action={handleSubmit} className="mt-8 space-y-4">
        {!isLogin ? (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-neutral-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
              placeholder="Jane Doe"
            />
            {fieldError("name") ? (
              <p className="text-sm text-rose-500">{fieldError("name")}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!fieldError("email")}
            aria-describedby={fieldError("email") ? "email-error" : undefined}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-300"
            placeholder="you@example.com"
          />
          {fieldError("email") ? (
            <p id="email-error" role="alert" className="text-sm text-rose-500">{fieldError("email")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-invalid={!!fieldError("password")}
            aria-describedby={fieldError("password") ? "password-error" : undefined}
            className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-300"
            placeholder="At least 8 characters"
          />
          {fieldError("password") ? (
            <p id="password-error" role="alert" className="text-sm text-rose-500">{fieldError("password")}</p>
          ) : null}
        </div>

        {!isLogin ? (
          <div className="space-y-2">
            <label htmlFor="password_confirmation" className="text-sm font-medium text-neutral-700">
              Confirm password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus-visible:ring-2 focus-visible:ring-rose-300"
              placeholder="Repeat your password"
            />
          </div>
        ) : null}

        {generalError ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {generalError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          {isPending ? "Please wait..." : isLogin ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={
            isLogin
              ? redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"
              : redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"
          }
          className="font-semibold text-neutral-900 underline underline-offset-4"
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
