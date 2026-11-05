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
  const [filter, setFilter] = useState<string>("ALL");

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // Backend starting or temporary network blip
    }
  };

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        setHealthStatus("All Services Operational");
      } else {
        setHealthStatus("Degraded Connectivity");
      }
    } catch {
      setHealthStatus("Connecting to Cluster...");
    }
  };

  useEffect(() => {
    fetchTasks();
    checkHealth();
    const interval = setInterval(() => {
      fetchTasks();
      checkHealth();
    }, 2000);
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
      console.error("Failed to enqueue task", err);
    } finally {
      setSubmitting(false);
    }
  };

  const quickSamples = [
    { title: "Generate Monthly PDF Report", payload: '{"pages": 24, "format": "A4"}' },
    { title: "Transcode Video to 1080p", payload: '{"codec": "H.265", "bitrate": "4Mbps"}' },
    { title: "Sync Customer CRM Records", payload: '{"source": "Salesforce", "limit": 1500}' },
    { title: "Generate Deep AI Embeddings", payload: '{"model": "text-embedding-3", "dim": 1536}' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const processingCount = tasks.filter((t) => t.status === "PROCESSING").length;
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Top Banner Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#0f172a]/70 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center font-bold text-white text-base">
              V
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">
                VEGAH <span className="text-indigo-400 font-normal">CloudOps</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 Prod
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              DevOps & Cloud Engineering Technical Assessment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                healthStatus.includes("Operational")
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-slate-300 font-mono text-[11px]">{healthStatus}</span>
          </div>

          <a
            href="https://github.com/ahyahya1616/vegah_cloud_devops_intern"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/80 shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub Code</span>
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Tasks Enqueued</span>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{tasks.length}</div>
            <span className="text-[10px] text-slate-500">Stored persistently in Postgres</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Active In Worker</span>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{processingCount}</div>
            <span className="text-[10px] text-slate-500">Live processing in BullMQ</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Completed</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{completedCount}</div>
            <span className="text-[10px] text-slate-500">Finished & verified</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
            <span className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Pending in Redis</span>
            <div className="text-2xl font-bold text-sky-400 mt-1 font-mono">{pendingCount}</div>
            <span className="text-[10px] text-slate-500">In queue waiting for worker</span>
          </div>
        </div>

        {/* Dispatch Form Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-indigo-950/30 border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm border border-indigo-500/30">
                  ⚡
                </span>
                Dispatch Asynchronous Background Job
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Post payload to NestJS REST API ➔ Stored as <code className="text-indigo-300 font-mono">PENDING</code> in PostgreSQL ➔ Published to Redis ➔ Consumed asynchronously by BullMQ Worker.
              </p>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono mr-1">Quick Presets:</span>
              {quickSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(sample.title);
                    setPayload(sample.payload);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
                >
                  {sample.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Job Name / Title</span>
                  <span className="text-[10px] text-slate-500">Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generate Analytical Financial Model"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition font-sans"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Payload Metadata</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder='e.g. {"batch": 250, "priority": "high"}'
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition font-mono text-xs"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[42px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium px-4 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Enqueue Job</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Tasks Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-white text-sm">
                Asynchronous Job Feed
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              {["ALL", "PENDING", "PROCESSING", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                    filter === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/50 uppercase text-[10px] text-slate-400 border-b border-slate-800/80 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Task ID</th>
                  <th className="px-6 py-3.5">Job Name</th>
                  <th className="px-6 py-3.5">Payload</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Worker Output</th>
                  <th className="px-6 py-3.5 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-sans">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">📋</span>
                        <p className="text-sm font-medium text-slate-400">No jobs found in this view</p>
                        <p className="text-xs text-slate-500">Dispatch a new job using the form above to trigger the BullMQ Redis worker.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition group">
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        <span className="text-indigo-400/90">#</span>{task.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-white font-sans font-medium">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 text-slate-400 truncate max-w-[160px] font-mono text-[11px]" title={task.payload}>
                        {task.payload || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : task.status === "PROCESSING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-400"
                                : task.status === "PROCESSING"
                                ? "bg-amber-400 animate-ping"
                                : "bg-sky-400"
                            }`}
                          />
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-[260px] truncate font-mono text-[11px]" title={task.result || ""}>
                        {task.result ? (
                          <span className="text-emerald-400">{task.result}</span>
                        ) : (
                          <span className="text-slate-500 italic">Processing in worker queue...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-[11px]">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infrastructure Topology Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">1. Frontend Layer</span>
              <span className="text-[10px] font-mono text-indigo-400">Next.js 16</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Standalone container, SSR & API reverse rewrite proxying.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">2. REST Engine</span>
              <span className="text-[10px] font-mono text-indigo-400">NestJS 12</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              TypeORM persistence, health probes, BullMQ job producer.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">3. Redis & PostgreSQL</span>
              <span className="text-[10px] font-mono text-indigo-400">Data Tier</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Named Docker volumes, sub-second queues & relational tables.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">4. Async Worker</span>
              <span className="text-[10px] font-mono text-indigo-400">BullMQ</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Isolated background processor decoupled from API HTTP threads.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
