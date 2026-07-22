export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Settings</h1>
      <p className="text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>Workspace and platform preferences</p>
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div className="card-title" style={{ marginBottom: 6 }}>Not built yet</div>
        <p className="text-muted" style={{ fontSize: 13, maxWidth: 460, margin: "0 auto" }}>
          Single shared passphrase is the only access control today — team members and
          notification preferences will live here if that becomes a real need.
        </p>
      </div>
    </div>
  );
}
