"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, User, AlertCircle } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get active tab from URL query params, default to 'login'
  const tabParam = searchParams.get("tab");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (tabParam === "signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [tabParam]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin
      ? { username, password }
      : { username, email: `${username}@archiscaler.internal`, password }; // satisfies backend contract requiring email

    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL+`${endpoint}`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.error || "Something went wrong.");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/home");
        }, 1000);
      } else {
        setSuccess("Registration successful! You can now log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-lg border border-border-dark bg-panel-dark shadow-2xl">
      {/* Tab Selector */}
      <div className="flex border-b border-border-dark mb-6">
        <button
          onClick={() => {
            setIsLogin(true);
            setError("");
            setSuccess("");
          }}
          className={`flex-1 pb-3 text-center text-sm font-bold transition-all ${
            isLogin
              ? "text-biscuit border-b-2 border-biscuit"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError("");
            setSuccess("");
          }}
          className={`flex-1 pb-3 text-center text-sm font-bold transition-all ${
            !isLogin
              ? "text-biscuit border-b-2 border-biscuit"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Sign Up
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        {isLogin
          ? "Log in to access your system architectures."
          : "Sign up to design and simulate microservices."}
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3.5 mb-4 rounded border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 mb-4 rounded border border-green-500/20 bg-green-500/10 text-green-200 text-sm">
          <AlertCircle className="w-5 h-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-canvas-dark border border-border-dark rounded px-10 py-2.5 text-sm text-white focus:outline-none focus:border-biscuit transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-canvas-dark border border-border-dark rounded px-10 py-2.5 text-sm text-white focus:outline-none focus:border-biscuit transition-colors"
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 rounded bg-biscuit text-canvas-dark font-bold text-sm hover:bg-biscuit-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-biscuit/10"
        >
          {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
        </button>
      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-canvas-dark text-gray-200 flex flex-col items-center justify-center px-6 relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1 text-sm font-medium hover:text-biscuit transition-colors text-gray-400"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Welcome Page
      </Link>

      <Suspense fallback={<div className="text-gray-400">Loading auth screen...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
