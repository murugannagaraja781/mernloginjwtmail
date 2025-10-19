import React, { useState } from "react";
import { apiFetch } from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token) {
        localStorage.setItem("token", res.token);

        // If backend doesn’t return user info, you can store email as a placeholder
        localStorage.setItem("user", JSON.stringify({ email }));

        setMsg("Logged in");

        // Redirect (choose admin or normal user if you store role somewhere)
        nav("/pos");
      } else {
        setMsg(res.message || "Invalid credentials");
      }
    } catch (err) {
      setMsg("Error logging in. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p style={{ color: "red" }}>{msg}</p>
      <p>
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => nav("/register")}
        >
          Register
        </span>
      </p>
    </div>
  );
}
