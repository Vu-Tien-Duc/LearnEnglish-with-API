import { useState } from "react";
import API from "../services/api"; // axios instance

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        Username: username,
        Password: password
      });

      // lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(res.data));

      // chuyển trang theo role
      if (res.data.Role === "Admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      alert("❌ Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "300px",
    margin: "100px auto",
    textAlign: "center",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "5px 0"
  },
  button: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none"
  }
};

export default Login;