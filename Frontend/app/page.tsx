import { fetchLaravelStatus } from "@/lib/backend";

export default async function Home() {
  const { backendUrl, endpoint, error, isConnected } = await fetchLaravelStatus();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section
        className="w-full max-w-xl rounded-3xl border p-8 shadow-[var(--shadow)] md:p-10"
        style={{
          background: isConnected ? "var(--success-surface)" : "var(--danger-surface)",
        }}
      >
        <div className="space-y-6">
          <div
            className="inline-flex rounded-full px-3 py-1 text-sm font-medium"
            style={{
              color: isConnected ? "var(--success)" : "var(--danger)",
              background: "var(--surface)",
            }}
          >
            {isConnected ? "Laravel connected" : "Laravel not connected"}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isConnected
                ? "Frontend is connected to Laravel."
                : "Frontend cannot reach Laravel."}
            </h1>
            <p className="text-base leading-7 text-[var(--muted)]">
              {isConnected
                ? "The Next.js app can reach the Laravel API."
                : "Start the Laravel server or check the backend URL in the frontend environment."}
            </p>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{ background: "var(--surface)" }}
          >
            <p className="text-sm font-medium text-[var(--muted)]">Backend URL</p>
            <p className="mt-1 break-all text-sm">{backendUrl}</p>
            <p className="mt-4 text-sm font-medium text-[var(--muted)]">Endpoint</p>
            <p className="mt-1 break-all text-sm">{endpoint}</p>
            {error ? (
              <p className="mt-4 text-sm" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
