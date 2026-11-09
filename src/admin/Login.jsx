import { useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError("Email o contraseña incorrectos.");
  };

  return (
    <main className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <h1>Iero <b>Service</b></h1>
        <p>Panel de administración</p>
        <label className="adm-field">
          <span>Email</span>
          <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="adm-field">
          <span>Contraseña</span>
          <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn primary full" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button>
      </form>
    </main>
  );
}
