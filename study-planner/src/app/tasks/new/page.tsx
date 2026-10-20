"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [course, setCourse] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, due, course, priority, completed: false }),
      });

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const message = typeof result === "object" && result !== null && "error" in result
          ? String(result.error)
          : "Impossible d’ajouter la tâche.";
        throw new Error(message);
      }

      router.push("/tasks");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Une erreur est survenue.");
      setIsSubmitting(false);
    }
  }

  const inputClassName = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-6 py-12 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/tasks" className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900">
          ← Retour aux tâches
        </Link>

        <section className="mt-8 rounded-3xl border border-white bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Nouvelle tâche</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Planifie ton prochain pas</h1>
          <p className="mt-2 text-slate-600">Ajoute les détails pour garder le cap sur tes études.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="title" className="text-sm font-semibold text-slate-700">Titre</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex. Réviser le chapitre 3"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="due" className="text-sm font-semibold text-slate-700">Échéance</label>
              <input
                id="due"
                name="due"
                type="date"
                value={due}
                onChange={(event) => setDue(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="course" className="text-sm font-semibold text-slate-700">Matière</label>
              <input
                id="course"
                name="course"
                type="text"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Ex. Biologie"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="priority" className="text-sm font-semibold text-slate-700">Priorité</label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}
                className={inputClassName}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-emerald-700 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ajout en cours…" : "Ajouter la tâche"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
