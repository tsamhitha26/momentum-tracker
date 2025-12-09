import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../utils/sync";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim())
      return setError("Username and password are required.");

    try {
      let data =
        mode === "login"
          ? await loginUser(username, password)
          : await registerUser(username, password);

      auth.login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-gray-50 to-gray-100 
      dark:from-gray-900 dark:to-gray-800 px-4">

      <div className="glass p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              className="w-full px-4 py-2 rounded-lg bg-white/40 
                dark:bg-gray-700/40 outline-none"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              className="w-full px-4 py-2 rounded-lg bg-white/40 
                dark:bg-gray-700/40 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 
            text-white rounded-lg font-semibold"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-indigo-600 hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-indigo-600 hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
