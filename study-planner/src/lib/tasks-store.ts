import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

export type Task = {
  id: string;
  title: string;
  due: string;
  completed: boolean;
  course?: string;
  priority?: "low" | "medium" | "high";
};

const TASKS_KEY = "study-planner:tasks";
const localTasksFile = path.join(process.cwd(), "..", "data", "tasks.json");

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function normalizeTasks(value: unknown): Task[] {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null && "tasks" in value
      ? (value as { tasks?: unknown }).tasks
      : null;
  if (!Array.isArray(entries)) throw new Error("Le stockage des tâches doit contenir un tableau.");

  return entries.map((entry: Record<string, unknown>) => ({
    ...entry,
    id: String(entry.id ?? randomUUID()),
    due: String(entry.due ?? entry.dueDate ?? ""),
    title: String(entry.title ?? ""),
    course: String(entry.course ?? entry.subject ?? ""),
    completed: entry.completed === true,
  }));
}

export async function readTasks(): Promise<Task[]> {
  const redis = getRedis();
  if (redis) {
    const stored = await redis.get<unknown>(TASKS_KEY);
    return stored === null ? [] : normalizeTasks(stored);
  }

  // Fallback local pour le développement uniquement : le disque Vercel n'est pas persistant.
  try {
    const content = await readFile(localTasksFile, "utf8");
    return content.trim() ? normalizeTasks(JSON.parse(content)) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(TASKS_KEY, tasks);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("Configure une base Redis Upstash (KV_REST_API_URL et KV_REST_API_TOKEN) dans Vercel.");
  }

  await writeFile(localTasksFile, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
}
