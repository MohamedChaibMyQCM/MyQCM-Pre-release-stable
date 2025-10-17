"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  setAccessToken,
  setRefreshToken,
  UnauthorizedError,
} from "@/app/lib/api";

const wrapperStyle: CSSProperties = {
  maxWidth: 420,
  margin: "4rem auto",
  display: "grid",
  gap: "1.5rem",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: "1rem",
};

const buttonStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: 4,
  border: "none",
  backgroundColor: "#111827",
  color: "#ffffff",
  fontSize: "1rem",
  cursor: "pointer",
};

type SigninResponse = {
  token?: { accessToken?: string; refreshToken?: string };
  message?: string;
};

export default function FreelancerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch<SigninResponse>(
        "/auth/freelancer/signin",
        {
          method: "POST",
          body: { email, password },
          tokenRequired: false,
        },
      );

      const accessToken = response?.token?.accessToken ?? "";
      if (!accessToken) {
        throw new Error("Missing access token in response.");
      }

      setAccessToken(accessToken);
      setRefreshToken(response?.token?.refreshToken ?? null);
      router.push("/generation/new");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setError("Invalid credentials. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message || "Login failed.");
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={wrapperStyle} suppressHydrationWarning>
      <header style={headerStyle}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Freelancer Login</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Sign in with your freelancer credentials to manage generation
          requests.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "1rem" }}
        noValidate
        suppressHydrationWarning
      >
        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
            placeholder="freelancer@example.com"
            suppressHydrationWarning
          />
        </label>

        <label style={{ display: "grid", gap: "0.5rem" }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
            placeholder="Your secure password"
            suppressHydrationWarning
          />
        </label>

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && (
        <p style={{ color: "#b91c1c", margin: 0 }} role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
