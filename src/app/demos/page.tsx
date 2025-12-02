export default function DemosPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🚀 Dynamic Component Demos</h1>
      <p>Performance optimization showcase</p>

      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem" }}>
        <a
          href="/demos/analytics"
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <h3>📊 Analytics Dashboard</h3>
          <p>Advanced analytics with dynamic loading</p>
        </a>

        <a
          href="/demos/inventory"
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <h3>📦 Inventory Management</h3>
          <p>Real-time inventory tracking</p>
        </a>

        <a
          href="/demos/chat"
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <h3>💬 AI Chat Assistant</h3>
          <p>Intelligent agricultural assistance</p>
        </a>

        <a
          href="/demos/test"
          style={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <h3>🧪 Test Page</h3>
          <p>Simple routing test</p>
        </a>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <h2>Performance Info</h2>
        <p>
          These demos showcase dynamic component loading for bundle size
          optimization.
        </p>
        <ul>
          <li>Client bundle savings: ~190-260 KB (projected)</li>
          <li>Dynamic imports with loading skeletons</li>
          <li>Code splitting for heavy libraries</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <a href="/farmer/dashboard" style={{ color: "#4a9d4a" }}>
          ← Back to Farmer Dashboard
        </a>
      </div>
    </div>
  );
}
