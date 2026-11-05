"use client";

import { useEffect, useState } from "react";

interface TaskItem {
  id: string;
  title: string;
  payload: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("Checking...");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // Backend might still be starting
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        setHealthStatus("Connected & Healthy");
      } else {
        setHealthStatus("Backend Degraded");
      }
    } catch {
      setHealthStatus("Offline / Connecting...");
    }
  };

  useEffect(() => {
    fetchTasks();
    checkHealth();
    const interval = setInterval(() => {
      fetchTasks();
      checkHealth();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, payload }),
      });
      if (res.ok) {
        setTitle("");
        setPayload("");
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: TaskItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-300 animate-pulse";
      case "FAILED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                VEGAH Cloud System
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                NestJS • Redis Worker • Postgres
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              DevOps Technical Assessment — Asynchronous Job Processing Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                healthStatus.includes("Healthy") ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-slate-300 font-mono">{healthStatus}</span>
          </div>
        </header>

        {/* Task Form Card */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            🚀 Enqueue Asynchronous Background Task
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Requests are sent to NestJS REST API, registered in PostgreSQL, pushed to Redis Queue, and processed asynchronously by the Redis Worker.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Task Title / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Generate Weekly Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Payload / Parameters (optional)</label>
              <input
                type="text"
                placeholder="e.g. { batchSize: 500, format: 'pdf' }"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "+ Dispatch Job to Redis"}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Jobs Feed */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
            <h3 className="font-semibold text-sm text-white">
              Task Queue Status ({tasks.length} jobs)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Auto-refreshing every 2.5s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/50 uppercase text-[10px] text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Payload</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Worker Result</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No jobs submitted yet. Use the form above to enqueue your first background job!
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]" title={task.id}>
                        {task.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-white font-sans font-medium">
                        {task.title}
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]">
                        {task.payload || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 max-w-[200px] truncate" title={task.result || ""}>
                        {task.result || "Awaiting worker..."}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Architecture Diagram & Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-400">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <p className="font-semibold text-slate-300">1. Client / UI</p>
            <p className="text-[11px] mt-0.5">Next.js App Router (Port 3000)</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <p className="font-semibold text-slate-300">2. REST API</p>
            <p className="text-[11px] mt-0.5">NestJS Engine (Port 4000)</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <p className="font-semibold text-slate-300">3. Queue & Persistence</p>
            <p className="text-[11px] mt-0.5">PostgreSQL 16 + Redis 7</p>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <p className="font-semibold text-slate-300">4. Async Worker</p>
            <p className="text-[11px] mt-0.5">BullMQ Worker Process</p>
          </div>
        </div>
      </div>
    </div>
  );
}
