"use client";
import { useTransition } from "react";
import { setTaskStatus } from "@/lib/actions";

/** Checkbox that flips a task between todo and done. */
export function TaskCheck({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const done = status === "done";
  return (
    <input
      type="checkbox"
      checked={done}
      disabled={pending}
      aria-label={done ? "Mark as todo" : "Mark as done"}
      className="h-4 w-4 cursor-pointer"
      style={{ width: 16, height: 16, padding: 0 }}
      onChange={(e) => start(() => setTaskStatus(id, e.target.checked ? "done" : "todo"))}
    />
  );
}

export default TaskCheck;
