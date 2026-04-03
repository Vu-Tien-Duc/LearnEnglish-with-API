import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1>Welcome to English Learning App</h1>

      <div style={styles.buttonGroup}>
        <button onClick={() => navigate("/login")} style={styles.btn}>
          Login
        </button>

        <button onClick={() => navigate("/register")} style={styles.btn}>
          Register
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGroup: {
    marginTop: "20px",
    display: "flex",
    gap: "20px",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Home;