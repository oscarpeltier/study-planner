"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  description?: string;
  due: string;
  completed: boolean;
  course?: string;
  priority?: "low" | "medium" | "high";
};

const priorityLabels: Record<NonNullable<Task["priority"]>, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

function formatDueDate(value: string) {
  if (!value) return "Aucune date définie";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void params.then(({ id: taskId }) => {
      if (!cancelled) setId(taskId);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    try {
      const savedTasks = window.localStorage.getItem("study-planner:tasks");
      if (savedTasks !== null) {
        const tasks: unknown = JSON.parse(savedTasks);
        if (Array.isArray(tasks)) {
          setTask((tasks as Task[]).find((item) => String(item.id) === id) ?? null);
        }
      }
    } catch {
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-12 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/tasks" className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900">
          ← Retour aux tâches
        </Link>

        {isLoading ? (
          <p role="status" className="mt-8 rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">Chargement de la tâche…</p>
        ) : !task ? (
          <section className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold">Tâche introuvable</h1>
            <p className="mt-2 text-slate-600">Cette tâche n’existe pas dans les tâches enregistrées sur ce navigateur.</p>
          </section>
        ) : (
          <article className="mt-8 rounded-3xl border border-white bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Détail de la tâche</p>
            <h1 className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
              {task.title}
            </h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl bg-slate-50 p-5">
                <h2 className="text-sm font-semibold text-slate-500">Date de rendu</h2>
                <p className="mt-2 font-medium">{formatDueDate(task.due)}</p>
              </section>
              <section className="rounded-2xl bg-slate-50 p-5">
                <h2 className="text-sm font-semibold text-slate-500">Importance</h2>
                <p className="mt-2 font-medium">{task.priority ? priorityLabels[task.priority] : "Non définie"}</p>
              </section>
            </div>
            {task.course && (
              <section className="mt-4 rounded-2xl bg-slate-50 p-5">
                <h2 className="text-sm font-semibold text-slate-500">Matière</h2>
                <p className="mt-2 font-medium">{task.course}</p>
              </section>
            )}
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-600">
                {task.description || "Aucune description n’a été ajoutée."}
              </p>
            </section>
          </article>
        )}
      </div>
    </main>
  );
}
