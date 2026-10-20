import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { readTasks, saveTasks, type Task } from "@/lib/tasks-store";

export async function GET() {
  try {
    return NextResponse.json(await readTasks(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Impossible de lire les tâches." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Le corps doit être un JSON valide." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Les données sont invalides." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if ((typeof input.id !== "string" && typeof input.id !== "number") || typeof input.completed !== "boolean") {
    return NextResponse.json({ error: "Un identifiant et un statut completed booléen sont requis." }, { status: 400 });
  }

  try {
    const tasks = await readTasks();
    const task = tasks.find((item) => String(item.id) === String(input.id));
    if (!task) return NextResponse.json({ error: "Tâche introuvable." }, { status: 404 });
    task.completed = input.completed;
    await saveTasks(tasks);
    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks failed:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer le statut. Vérifie la configuration de la base de données Vercel." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Le corps doit être un JSON valide." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Les données de la tâche sont invalides." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (
    typeof input.title !== "string" || !input.title.trim() ||
    typeof input.due !== "string" || typeof input.completed !== "boolean" ||
    (input.course !== undefined && typeof input.course !== "string") ||
    (input.priority !== undefined && !["low", "medium", "high"].includes(String(input.priority)))
  ) {
    return NextResponse.json({ error: "Titre, échéance et statut requis ; matière et priorité doivent être valides." }, { status: 400 });
  }

  const task: Task = {
    id: randomUUID(),
    title: input.title.trim(),
    due: input.due.trim(),
    completed: input.completed,
    course: typeof input.course === "string" ? input.course.trim() : "",
    priority: input.priority as Task["priority"],
  };

  try {
    const tasks = await readTasks();
    tasks.push(task);
    await saveTasks(tasks);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    return NextResponse.json({ error: "Impossible d’enregistrer la tâche. Vérifie la configuration de la base de données Vercel." }, { status: 500 });
  }
}
