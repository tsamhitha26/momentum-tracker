import React from "react";
import PageShell from "../components/PageShell";
import SettingsModal from "../components/SettingsModal";

export default function Settings() {
  return (
    <PageShell
      eyebrow="Settings"
      title="Preferences"
      description="Focus, notifications, appearance, and productivity goals."
    >
      <SettingsModal />
    </PageShell>
  );
}
