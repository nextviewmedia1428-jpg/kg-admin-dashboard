export default function KnowledgePage() {
  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Knowledge Base</h1>
      <p className="text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>Documents that ground every AI answer, per business</p>
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div className="card-title" style={{ marginBottom: 6 }}>Managed per business</div>
        <p className="text-muted" style={{ fontSize: 13, maxWidth: 460, margin: "0 auto" }}>
          Knowledge bases are scoped to a single business (Retell looks documents up by the
          dialed number). Open a business and use its Knowledge Base tab to upload or manage
          documents.
        </p>
      </div>
    </div>
  );
}
