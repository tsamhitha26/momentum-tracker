import React from "react";
import PageShell from "../components/PageShell";
import FocusSummary from "../components/FocusSummary";
import HistoryChart from "../components/HistoryChart";

export default function Analytics() {
  return (
    <PageShell
      eyebrow="Analytics"
      title="Progress"
      description="A compact read on today's focus and recent history."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <FocusSummary />

        <HistoryChart />
      </div>
    </PageShell>
  );
}
