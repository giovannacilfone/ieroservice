import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { Confirm, Form, Modal } from "./ui.jsx";

// Pantalla CRUD genérica: lista con buscador, pestañas opcionales y modal de alta/edición.
export default function Resource({ table, title, singular, columns, fields, order, tabs, sort, fem }) {
  const [rows, setRows] = useState(null);
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(null); // null = cerrado, {} = nuevo, fila = edición
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState(false); // diálogo de confirmación de borrado

  const needsClients = fields.some(f => f.type === "client");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").order(order.column, { ascending: order.ascending });
    if (error) setError(error.message); else setRows(data);
  }, [table, order.column, order.ascending]);

  useEffect(() => { setRows(null); load(); }, [load]);

  useEffect(() => {
    if (!needsClients) return;
    supabase.from("clients").select("id,name,phone").order("name").then(({ data }) => setClients(data || []));
  }, [needsClients]);

  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);

  const shown = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    let list = rows;
    if (tabs) list = list.filter(tabs[tab].filter);
    if (needle) {
      list = list.filter(r =>
        (Object.values(r).join(" ") + " " + (clientsById[r.client_id]?.name || "")).toLowerCase().includes(needle)
      );
    }
    return sort ? [...list].sort(sort) : list;
  }, [rows, q, tab, tabs, sort, clientsById]);

  const close = () => { setEditing(null); setError(""); };

  const save = async vals => {
    setSaving(true); setError("");
    const req = editing.id
      ? supabase.from(table).update(vals).eq("id", editing.id)
      : supabase.from(table).insert(vals);
    const { error } = await req;
    setSaving(false);
    if (error) return setError(error.message);
    close(); load();
  };

  const remove = async () => {
    setSaving(true);
    const { error } = await supabase.from(table).delete().eq("id", editing.id);
    setSaving(false);
    setAsk(false);
    if (error) return setError(error.message);
    close(); load();
  };

  return (
    <section>
      <header className="adm-head">
        <h1>{title}</h1>
        <button className="adm-btn primary" onClick={() => setEditing({})}>+ {fem ? "Nueva" : "Nuevo"} {singular}</button>
      </header>

      <div className="adm-toolbar">
        <input className="adm-search" type="search" placeholder={`Buscar en ${title.toLowerCase()}…`} value={q} onChange={e => setQ(e.target.value)} />
        {tabs && (
          <div className="adm-tabs">
            {tabs.map((t, i) => <button key={t.label} className={i === tab ? "on" : ""} onClick={() => setTab(i)}>{t.label}</button>)}
          </div>
        )}
      </div>

      {error && !editing && <p className="adm-error">{error}</p>}

      <div className="adm-card adm-tablewrap">
        {rows === null ? (
          <p className="adm-empty">Cargando…</p>
        ) : shown.length === 0 ? (
          <p className="adm-empty">{rows.length ? "No hay resultados." : `Todavía no hay ${title.toLowerCase()}. Creá el primero con el botón de arriba.`}</p>
        ) : (
          <table className="adm-table">
            <thead><tr>{columns.map(c => <th key={c.label} className={c.cls}>{c.label}</th>)}</tr></thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.id} onClick={() => setEditing(r)} tabIndex={0} onKeyDown={e => e.key === "Enter" && e.target === e.currentTarget && setEditing(r)}>
                  {columns.map(c => (
                    <td key={c.label} className={c.cls} onClick={c.stop ? e => e.stopPropagation() : undefined}>{c.render(r, { clientsById })}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} onClose={close} title={editing?.id ? `Editar ${singular}` : `${fem ? "Nueva" : "Nuevo"} ${singular}`}>
        {editing && (
          <Form
            key={editing.id || "new"}
            fields={fields}
            initial={editing}
            clients={clients}
            onSubmit={save}
            onDelete={editing.id ? () => setAsk(true) : undefined}
            saving={saving}
            error={error}
          />
        )}
      </Modal>

      <Confirm
        open={ask}
        title={`¿Eliminar este ${singular}?`}
        message="Esta acción no se puede deshacer."
        busy={saving}
        onConfirm={remove}
        onCancel={() => setAsk(false)}
      />
    </section>
  );
}
