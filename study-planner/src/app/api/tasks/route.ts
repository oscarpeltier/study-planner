import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const tasksFile = path.join(process.cwd(), "..", "data", "tasks.json");

type Task = {
  id: string;
  title: string;
  due: string;
  completed: boolean;
  course?: string;
  priority?: "low" | "medium" | "high";
};

async function readTasks(): Promise<Task[]> {
  try {
    const content = await readFile(tasksFile, "utf8");
    if (!content.trim()) return [];

    const parsed: unknown = JSON.parse(content);
    // Accepte le tableau JSON historique ainsi que la forme { tasks: [...] }.
    const tasks = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && "tasks" in parsed
        ? parsed.tasks
        : null;
    if (!Array.isArray(tasks)) throw new Error("Le fichier de tâches doit contenir un tableau JSON.");

    return tasks.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item.id ?? randomUUID()),
      due: String(item.due ?? item.dueDate ?? ""),
      course: String(item.course ?? item.subject ?? ""),
    })) as Task[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function GET() {
  try {
    return NextResponse.json(await readTasks());
  } catch {
    return NextResponse.json({ error: "Impossible de lire les tâches." }, { status: 500 });
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
    typeof input.due !== "string" ||
    typeof input.completed !== "boolean" ||
    (input.course !== undefined && typeof input.course !== "string") ||
    (input.priority !== undefined && !["low", "medium", "high"].includes(String(input.priority)))
  ) {
    return NextResponse.json(
      { error: "Titre, échéance et statut requis ; matière et priorité doivent être valides." },
      { status: 400 },
    );
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
    await mkdir(path.dirname(tasksFile), { recursive: true });
    const tasks = await readTasks();
    tasks.push(task);
    await writeFile(tasksFile, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d’enregistrer la tâche. Vérifie que le serveur peut écrire dans data/tasks.json." }, { status: 500 });
  }
}
