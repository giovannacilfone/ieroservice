import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import "./admin.css";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Resource from "./Resource.jsx";
import Jobs from "./Jobs.jsx";
import { CLIENTS, PROVIDERS, VISITS, NOTES } from "./schema.jsx";

const TABS = [
  ["resumen", "Resumen"],
  ["visitas", "Visitas"],
  ["clientes", "Clientes"],
  ["trabajos", "Trabajos"],
  ["proveedores", "Proveedores"],
  ["notas", "Notas"],
];

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState(() => window.location.hash.slice(1) || "resumen");
  const [menu, setMenu] = useState(false);

  // El panel no debe indexarse en buscadores
  useEffect(() => {
    document.title = "Panel · Iero Service";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const go = t => { setTab(t); setMenu(false); window.history.replaceState(null, "", `#${t}`); window.scrollTo(0, 0); };

  if (!supabase) {
    return (
      <main className="adm-login">
        <div className="adm-login-card">
          <h1>Falta configurar</h1>
          <p>Definí <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> (archivo <code>.env.local</code> o variables de Vercel).</p>
        </div>
      </main>
    );
  }
  if (session === undefined) return <main className="adm-login"><p className="adm-empty">Cargando…</p></main>;
  if (!session) return <Login />;

  const views = {
    resumen: <Dashboard go={go} />,
    visitas: <Resource {...VISITS} />,
    clientes: <Resource {...CLIENTS} />,
    trabajos: <Jobs />,
    proveedores: <Resource {...PROVIDERS} />,
    notas: <Resource {...NOTES} />,
  };

  return (
    <div className="adm">
      <aside className={`adm-side ${menu ? "open" : ""}`}>
        <div className="adm-brand">Iero <b>Service</b></div>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <div className="adm-user">
          <small>{session.user.email}</small>
          <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(m => !m)} aria-label="Menú">☰</button>
          <span>Iero <b>Service</b></span>
        </div>
        <div className="adm-content">{views[tab] || views.resumen}</div>
      </div>
      {menu && <div className="adm-scrim" onClick={() => setMenu(false)} />}
    </div>
  );
}
