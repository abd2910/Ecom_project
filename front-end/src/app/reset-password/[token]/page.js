"use client";
import { useState } from "react";
import axios from "axios";

export default function ResetPassword({ params }) {
     
  const { token } = params;
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `http://localhost:8000/api/users/reset-password/${token}`,
        { password }
      );
      setMsg(res.data.message);
    } catch (error) {
      setMsg(error.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Reset Password
        </button>
      </form>

      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
