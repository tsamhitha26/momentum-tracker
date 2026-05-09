import React from "react";
import PageShell from "../components/PageShell";
import TimerSection from "../components/TimerSection";

export default function Focus() {
  const saveSession = () => {
    window.dispatchEvent(new Event("history-updated"));
  };

  return (
    <PageShell
      eyebrow="Focus"
      title="Focus session"
      description="Set the duration and start a focused block."
    >
      <TimerSection onComplete={saveSession} />
    </PageShell>
  );
}
