import React, { useEffect, useState } from "react";
import { syncLocalToServer, getUser } from "../utils/sync";

export default function SyncStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(
    localStorage.getItem("momentum-last-sync")
  );

  /* -----------------------------------------
     Detect Online / Offline
  ----------------------------------------- */
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  /* -----------------------------------------
     Update last sync info when local history changes
  ----------------------------------------- */
  useEffect(() => {
    const handler = () => {
      setLastSync(localStorage.getItem("momentum-last-sync"));
    };

    window.addEventListener("history-updated", handler);
    window.addEventListener("user-changed", handler);

    return () => {
      window.removeEventListener("history-updated", handler);
      window.removeEventListener("user-changed", handler);
    };
  }, []);

  /* -----------------------------------------
     Manual Sync Trigger
  ----------------------------------------- */
  async function handleManualSync() {
    const user = getUser();
    if (!user) return;

    setSyncing(true);

    try {
      const result = await syncLocalToServer();

      if (result) {
        const now = new Date().toISOString();
        localStorage.setItem("momentum-last-sync", now);
        setLastSync(now);
      }
    } catch (err) {
      console.warn("Manual sync failed", err.message);
    }

    setSyncing(false);
  }

  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        marginBottom: 18,
        background: online ? "#e8ffe8" : "#ffe8e8",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 14,
      }}
    >
      {/* LEFT STATUS */}
      <div>
        <strong>Status:</strong>{" "}
        {online ? (
          <span style={{ color: "green" }}>Online</span>
        ) : (
          <span style={{ color: "red" }}>Offline — saving locally</span>
        )}
        <br />
        <strong>Last Sync:</strong>{" "}
        {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
      </div>

      {/* RIGHT BUTTON */}
      <button
        onClick={handleManualSync}
        disabled={!online || syncing}
        style={{
          padding: "6px 14px",
          background: syncing ? "#777" : "#4e6cff",
          color: "white",
          borderRadius: 6,
          border: "none",
          cursor: online && !syncing ? "pointer" : "not-allowed",
        }}
      >
        {syncing ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}
