"use client";
import { useTransition } from "react";
import { setTaskStatus } from "@/lib/actions";

export default function TaskCheckbox({ id, done }: { id: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      checked={done}
      disabled={pending}
      onChange={e => start(() => setTaskStatus(id, e.target.checked ? "done" : "todo"))}
      style={{ width: 16, height: 16, padding: 0 }}
      aria-label={done ? "Mark as todo" : "Mark as done"}
    />
  );
}
