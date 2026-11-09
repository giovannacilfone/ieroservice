import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { Badge, STATUS_TONE, WaButton, fmtDate } from "./ui.jsx";

const count = (table, mod) => {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (mod) q = mod(q);
  return q.then(r => r.count ?? 0);
};

export default function Dashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [next, setNext] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const upcoming = q => q.gte("scheduled_at", startOfDay.toISOString()).not("status", "in", "(cancelada,realizada)");

    Promise.all([count("clients"), count("providers"), count("visits", upcoming), count("jobs")]).then(setStats);

    supabase.from("visits").select("*, clients(name, phone)")
      .gte("scheduled_at", startOfDay.toISOString()).not("status", "in", "(cancelada,realizada)")
      .order("scheduled_at").limit(6).then(({ data }) => setNext(data || []));

    supabase.from("notes").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false })
      .limit(4).then(({ data }) => setNotes(data || []));
  }, []);

  const tiles = stats && [
    ["Visitas próximas", stats[2], "visitas"],
    ["Clientes", stats[0], "clientes"],
    ["Trabajos realizados", stats[3], "trabajos"],
    ["Proveedores", stats[1], "proveedores"],
  ];
  const isToday = iso => new Date(iso).toDateString() === new Date().toDateString();

  return (
    <section>
      <header className="adm-head"><h1>Resumen</h1></header>

      <div className="adm-stats">
        {(tiles || Array(4).fill(["…", "…", ""])).map(([label, n, to], i) => (
          <button key={i} className="adm-card adm-stat" onClick={() => to && go(to)}>
            <strong>{n}</strong><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="adm-cols">
        <div className="adm-card">
          <div className="adm-card-head"><h2>Próximas visitas</h2><button className="adm-link" onClick={() => go("visitas")}>Ver todas</button></div>
          {next === null ? <p className="adm-empty">Cargando…</p> : next.length === 0 ? <p className="adm-empty">No hay visitas agendadas.</p> : (
            <ul className="adm-list">
              {next.map(v => (
                <li key={v.id}>
                  <div>
                    <strong className="adm-phone">{v.clients?.name || "Sin cliente"}<WaButton phone={v.clients?.phone} /></strong>
                    <small>{[v.appliance, v.address].filter(Boolean).join(" · ") || "—"}</small>
                  </div>
                  <div className="adm-when">
                    {isToday(v.scheduled_at) && <Badge tone="green">Hoy</Badge>}
                    <span>{fmtDate(v.scheduled_at)}</span>
                    <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Notas</h2><button className="adm-link" onClick={() => go("notas")}>Ver todas</button></div>
          {notes.length === 0 ? <p className="adm-empty">No hay notas.</p> : (
            <ul className="adm-list">
              {notes.map(n => (
                <li key={n.id}>
                  <div>
                    <strong>{n.pinned ? "📌 " : ""}{n.title}</strong>
                    <small>{n.body ? n.body.slice(0, 90) + (n.body.length > 90 ? "…" : "") : "—"}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
