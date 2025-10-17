"use client";

import {
  useState,
  type CSSProperties,
  type FormEvent,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { checkAuthAndRedirect } from "@/utils/auth";

const wrapperStyle: CSSProperties = {
  maxWidth: 440,
  margin: "4rem auto",
  display: "grid",
  gap: "1.75rem",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "2rem",
  display: "grid",
  gap: "1.25rem",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const inputStyle: CSSProperties = {
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: "1rem",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const buttonStyle: CSSProperties = {
  padding: "0.85rem 1rem",
  borderRadius: 10,
  border: "none",
  background:
    "linear-gradient(135deg, rgba(248,88,159,0.95), rgba(237,70,144,0.95))",
  color: "#ffffff",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const loading = isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await BaseUrl.post("/auth/user/signin", {
          email,
          password,
        });

        const token = response?.data?.token;
        if (!token) {
          throw new Error("Authentication succeeded but no token was returned.");
        }

        secureLocalStorage.setItem("token", token);

        const redirected = await checkAuthAndRedirect(router);
        if (!redirected) {
          router.push("/dashboard");
        }
      } catch (err: any) {
        const rawMessage = err?.response?.data?.message;
        const parsedMessage = Array.isArray(rawMessage)
          ? rawMessage[0]
          : rawMessage;
        const fallback =
          err?.message ??
          "Connexion impossible. Vérifiez vos identifiants.";
        setError(
          typeof parsedMessage === "string" && parsedMessage.trim()
            ? parsedMessage
            : typeof fallback === "string"
            ? fallback
            : "Connexion impossible. Vérifiez vos identifiants.",
        );
      }
    });
  };

  return (
    <main style={wrapperStyle} suppressHydrationWarning>
      <header style={{ display: "grid", gap: "0.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", margin: 0, color: "#111827" }}>
          Connexion à MyQCM
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Retrouve tes parcours, tes entraînements et poursuis ta progression
          personnalisée.
        </p>
      </header>

      <section style={cardStyle}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "1rem" }}
          noValidate
          suppressHydrationWarning
        >
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={{ fontWeight: 600, color: "#1f2937" }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
              placeholder="prenom.nom@example.com"
              suppressHydrationWarning
            />
          </label>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={{ fontWeight: 600, color: "#1f2937" }}>
              Mot de passe
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
              placeholder="Votre mot de passe sécurisé"
              suppressHydrationWarning
            />
          </label>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#b91c1c", margin: 0 }} role="alert">
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.95rem",
            color: "#4b5563",
          }}
        >
          <Link href="/reset" style={{ color: "#ef3b8f" }}>
            Mot de passe oublié ?
          </Link>
          <span>
            Pas encore de compte ?{" "}
            <Link href="/signup" style={{ color: "#ef3b8f", fontWeight: 600 }}>
              S&apos;inscrire
            </Link>
          </span>
        </div>
      </section>
    </main>
  );
}
