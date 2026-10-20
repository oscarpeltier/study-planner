"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Task = {
  id?: string;
  title: string;
  due: string;
  completed: boolean;
  course?: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks", { signal: controller.signal });
        if (!response.ok) throw new Error("Impossible de charger les tâches.");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("La réponse de l’API est invalide.");
        setTasks(data as Task[]);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name !== "AbortError") {
          setError(fetchError.message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadTasks();
    return () => controller.abort();
  }, []);

  async function updateCompletion(task: Task, completed: boolean) {
    if (!task.id) {
      setUpdateError("Cette tâche n’a pas d’identifiant et ne peut pas être mise à jour.");
      return;
    }

    setUpdateError(null);
    // Met à jour l’interface immédiatement, puis restaure l’état précédent en cas d’erreur.
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed } : item));
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed }),
      });
      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const message = typeof result === "object" && result !== null && "error" in result
          ? String(result.error)
          : "La mise à jour n’a pas pu être enregistrée.";
        throw new Error(message);
      }
    } catch (updateFailure) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: task.completed } : item));
      setUpdateError(updateFailure instanceof Error ? updateFailure.message : "Impossible d’enregistrer le statut de la tâche.");
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-12 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Ton organisation</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Mes tâches</h1>
            <p className="mt-3 text-slate-600">Chaque tâche terminée te rapproche de tes objectifs.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tasks/new" className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              Nouvelle tâche
            </Link>
            <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500">Progression</p>
              <p className="mt-1 text-xl font-semibold">{completedCount} <span className="text-base font-normal text-slate-500">/ {tasks.length} terminées</span></p>
            </div>
          </div>
        </header>

        {updateError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{updateError}</p>}

        {isLoading ? (
          <p role="status" className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-600 shadow-sm">
            Chargement des tâches…
          </p>
        ) : error ? (
          <p role="alert" className="rounded-3xl border border-red-100 bg-white p-8 text-center text-red-700 shadow-sm">
            {error}
          </p>
        ) : tasks.length === 0 ? (
          <p className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-600 shadow-sm">
            Aucune tâche pour le moment.
          </p>
        ) : (
          <section aria-label="Liste des tâches" className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task, index) => (
              <article
                key={task.id ?? `${task.title}-${index}`}
                className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  task.completed ? "border-emerald-100" : "border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {task.course ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {task.course}
                    </span>
                  ) : <span />}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    task.completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {task.completed ? "Terminée" : "À faire"}
                  </span>
                </div>
                <div className="mt-6 flex items-start justify-between gap-4">
                  <h2 className={`text-lg font-semibold leading-snug ${task.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
                    {task.title}
                  </h2>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(event) => void updateCompletion(task, event.target.checked)}
                      aria-label={`Marquer « ${task.title} » comme terminée`}
                      className="h-4 w-4 accent-emerald-700"
                    />
                    Terminée
                  </label>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <span aria-hidden="true">◷</span> Échéance : {task.due}
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
