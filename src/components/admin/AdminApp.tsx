import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import CalendarApp from "../calendar/CalendarApp";
import "./admin-ui.css";

type AuthState = "checking" | "anonymous" | "authenticated";
type AdminApiPayload = {
  error?: string;
  username?: string;
};

const localAdminApiMessage =
  "Administrace se připojí po spuštění Netlify režimu nebo na nasazeném webu.";

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session", { credentials: "same-origin" });
        if (isMounted) {
          setAuthState(response.ok ? "authenticated" : "anonymous");
        }
      } catch {
        if (isMounted) {
          setAuthState("anonymous");
          setMessage("Přihlášení se ověří po nasazení na Netlify.");
        }
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(event: { preventDefault: () => void }) {
    event.preventDefault();
    setMessage("Ověřuji přístup...");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await readAdminApiPayload(response);
      if (!payload) {
        throw new Error(localAdminApiMessage);
      }
      if (!response.ok) {
        throw new Error(payload.error ?? "Přihlášení se nepodařilo.");
      }
      setPassword("");
      setAuthState("authenticated");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Přihlášení se nepodařilo.");
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
    setAuthState("anonymous");
    setPassword("");
  }

  if (authState === "checking") {
    return (
      <section className="admin-app admin-loading" aria-live="polite">
        <p>Ověřuji přihlášení...</p>
      </section>
    );
  }

  if (authState === "anonymous") {
    return (
      <section className="admin-app admin-login-shell">
        <form className="admin-login" onSubmit={login}>
          <p className="admin-eyebrow">TJ Baník Rynholec</p>
          <h1>Administrace</h1>
          <p>Jeden sdílený přístup pro správu kalendáře, Excel importu a základních zápisů.</p>

          <label>
            Uživatelské jméno
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </label>
          <label>
            Heslo
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="admin-primary-button" type="submit">
            Přihlásit
          </button>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="admin-app">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Jeden sdílený admin účet</p>
          <h1>Administrace</h1>
          <p>Správa kalendáře funguje ručně na webu i přes offline Excel šablonu.</p>
        </div>
        <button className="admin-logout" onClick={logout} type="button">
          <LogOut aria-hidden="true" size={17} />
          Odhlásit
        </button>
      </header>

      <div className="admin-section-heading">
        <h2>Kalendář a Excel</h2>
      </div>

      <CalendarApp mode="admin" />
    </section>
  );
}

async function readAdminApiPayload(response: Response): Promise<AdminApiPayload | null> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.toLowerCase().includes("text/html")) {
    return null;
  }

  try {
    return (await response.json()) as AdminApiPayload;
  } catch {
    return null;
  }
}
