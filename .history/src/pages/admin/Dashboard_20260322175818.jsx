function Dashboard() {
  return (
    <div>
      <h1>📊 Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={card}>📘 Vocabulary: 8</div>
        <div style={card}>📂 Categories: 3</div>
        <div style={card}>🧠 Quiz: 5</div>
      </div>
    </div>
  );
}

const card = {
  padding: "20px",
  background: "#ecf0f1",
  borderRadius: "10px",
  minWidth: "150px",
  textAlign: "center"
};

export default Dashboard;