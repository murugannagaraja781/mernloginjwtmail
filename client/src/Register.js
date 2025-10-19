import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (res.success) {
        setMsg("Registered successfully. Redirecting to login...");
        setTimeout(() => nav("/login"), 1500);
      } else {
        setMsg(res.msg || "Registration failed");
      }
    } catch (err) {
      setMsg("Error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardBody className="p-6 flex flex-col gap-4">
          <Typography variant="h4" color="blue-gray" className="text-center">
            Register
          </Typography>

          {msg && (
            <Typography color="red" className="text-center text-sm">
              {msg}
            </Typography>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="mt-2">
              Register
            </Button>
          </form>

          <Typography variant="small" className="mt-2 text-center">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => nav("/login")}
            >
              Login
            </span>
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}
