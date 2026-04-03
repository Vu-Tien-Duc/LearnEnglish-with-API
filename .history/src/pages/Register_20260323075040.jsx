import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Register thành công!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      alert("Lỗi server");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Register</h2>

      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
      /><br /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /><br /><br />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      /><br /><br />

      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}

export default Register;