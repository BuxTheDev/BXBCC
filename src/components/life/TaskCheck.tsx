"use client";
import { useTransition } from "react";
import { setTaskStatus } from "@/lib/actions";

export function TaskCheck({ id, done }: { id: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input type="checkbox" checked={done} disabled={pending} aria-label="Mark done" className="h-4 w-4 cursor-pointer"
      style={{ width: 16, padding: 0 }}
      onChange={e => start(() => setTaskStatus(id, e.target.checked ? "done" : "todo"))} />
  );
}
