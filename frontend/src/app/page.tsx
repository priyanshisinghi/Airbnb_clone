"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.status === "ok") {
          setHealthStatus("Backend connected");
        } else {
          setHealthStatus(`Backend response: ${JSON.stringify(data)}`);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to connect to backend");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-rose-500 mb-4">
          Airbnb Clone
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Stage 1: Project Foundation & Health Check
        </p>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          {loading && (
            <div className="text-sm text-gray-500 animate-pulse">
              Checking backend connection...
            </div>
          )}
          {!loading && healthStatus && (
            <div className="flex items-center justify-center space-x-2 text-emerald-600 font-medium text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{healthStatus}</span>
            </div>
          )}
          {!loading && error && (
            <div className="flex items-center justify-center space-x-2 text-amber-600 font-medium text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Error: {error}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
