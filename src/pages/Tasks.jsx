import React from "react";
import PageShell from "../components/PageShell";
import TaskList from "../components/TaskList";

export default function Tasks() {
  return (
    <PageShell
      eyebrow="Tasks"
      title="Task workspace"
      description="Plan, edit, and clear work without leaving the flow."
    >
      <TaskList />
    </PageShell>
  );
}
