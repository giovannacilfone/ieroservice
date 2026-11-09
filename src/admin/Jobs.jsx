import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { Confirm, Form, Modal, fmtDate } from "./ui.jsx";

const BUCKET = "trabajos";
const money = n => Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const FIELDS = [
  { key: "title", label: "Título", required: true, span: 4, placeholder: "Ej: Cambio de motor de lavarropas" },
  { key: "done_at", label: "Fecha", type: "date", span: 2, default: () => new Date().toLocaleDateString("sv-SE") },
  { key: "client_id", label: "Cliente", type: "client" },
  { key: "appliance", label: "Electrodoméstico" },
  { key: "cost", label: "Importe cobrado ($)", type: "number" },
  { key: "parts_cost", label: "Gasto en repuestos ($)", type: "number", placeholder: "Opcional" },
  { key: "description", label: "Detalle de lo que se arregló", type: "textarea", rows: 4 },
];

// Reduce las fotos del celular (varios MB) antes de subirlas
async function compress(file, max = 1600) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, "image/jpeg", 0.82));
}

export default function Jobs() {
  const [rows, setRows] = useState(null);
  const [clients, setClients] = useState([]);
  const [urls, setUrls] = useState({});
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [kept, setKept] = useState([]);   // fotos existentes que se conservan
  const [added, setAdded] = useState([]); // archivos nuevos
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState(false); // diálogo de confirmación de borrado

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("jobs").select("*").order("done_at", { ascending: false });
    if (error) return setError(error.message);
    setRows(data);
    const paths = data.flatMap(j => j.photos || []);
    if (paths.length) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
      setUrls(Object.fromEntries((signed || []).filter(s => s.signedUrl).map(s => [s.path, s.signedUrl])));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    supabase.from("clients").select("id,name").order("name").then(({ data }) => setClients(data || []));
  }, []);

  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (rows || []).filter(r => !n || (r.title + " " + (r.appliance || "") + " " + (r.description || "") + " " + (clientsById[r.client_id]?.name || "")).toLowerCase().includes(n));
  }, [rows, q, clientsById]);

  const open = job => { setEditing(job); setKept(job.photos || []); setAdded([]); setError(""); };
  const close = () => { setEditing(null); setError(""); setAdded([]); };

  const previews = useMemo(() => added.map(f => URL.createObjectURL(f)), [added]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const save = async vals => {
    setSaving(true); setError("");
    try {
      const uploaded = [];
      for (const file of added) {
        const blob = await compress(file);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        uploaded.push(path);
      }
      const payload = { ...vals, photos: [...kept, ...uploaded] };
      const { error } = editing.id
        ? await supabase.from("jobs").update(payload).eq("id", editing.id)
        : await supabase.from("jobs").insert(payload);
      if (error) throw error;
      // Borra del storage las fotos que se quitaron
      const removed = (editing.photos || []).filter(p => !kept.includes(p));
      if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
      close(); load();
    } catch (e) {
      setError(e.message || "No se pudo guardar.");
    }
    setSaving(false);
  };

  const remove = async () => {
    setSaving(true);
    if (editing.photos?.length) await supabase.storage.from(BUCKET).remove(editing.photos);
    const { error } = await supabase.from("jobs").delete().eq("id", editing.id);
    setSaving(false);
    setAsk(false);
    if (error) return setError(error.message);
    close(); load();
  };

  return (
    <section>
      <header className="adm-head">
        <h1>Trabajos realizados</h1>
        <button className="adm-btn primary" onClick={() => open({})}>+ Nuevo trabajo</button>
      </header>
      <div className="adm-toolbar">
        <input className="adm-search" type="search" placeholder="Buscar trabajos…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {error && !editing && <p className="adm-error">{error}</p>}

      {rows === null ? <p className="adm-empty">Cargando…</p> : shown.length === 0 ? (
        <div className="adm-card"><p className="adm-empty">{rows.length ? "No hay resultados." : "Todavía no cargaste trabajos. Sumá el primero con fotos de lo que arreglaste."}</p></div>
      ) : (
        <div className="adm-gallery">
          {shown.map(j => (
            <button key={j.id} className="adm-job" onClick={() => open(j)}>
              <div className="adm-job-img">
                {j.photos?.[0] && urls[j.photos[0]] ? <img src={urls[j.photos[0]]} alt="" loading="lazy" /> : <span>Sin fotos</span>}
                {j.photos?.length > 1 && <em>{j.photos.length} fotos</em>}
              </div>
              <div className="adm-job-body">
                <strong>{j.title}</strong>
                <small>{clientsById[j.client_id]?.name || "Sin cliente"} · {fmtDate(j.done_at)}</small>
                {j.cost != null && (
                  <small className="adm-job-money">
                    Cobrado {money(j.cost)}
                    {j.parts_cost != null && <> · Repuestos {money(j.parts_cost)} · <b>Ganancia {money(j.cost - j.parts_cost)}</b></>}
                  </small>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={close} title={editing?.id ? "Editar trabajo" : "Nuevo trabajo"}>
        {editing && (
          <Form key={editing.id || "new"} fields={FIELDS} initial={editing} clients={clients}
            onSubmit={save} onDelete={editing.id ? () => setAsk(true) : undefined} saving={saving} error={error}>
            <div className="adm-photos">
              <span className="adm-photos-title">Fotos</span>
              <div className="adm-thumbs">
                {kept.map(p => (
                  <div className="adm-thumb" key={p}>
                    {urls[p] ? <img src={urls[p]} alt="" /> : <span />}
                    <button type="button" onClick={() => setKept(k => k.filter(x => x !== p))} aria-label="Quitar foto">×</button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div className="adm-thumb" key={src}>
                    <img src={src} alt="" />
                    <button type="button" onClick={() => setAdded(a => a.filter((_, j) => j !== i))} aria-label="Quitar foto">×</button>
                  </div>
                ))}
                <label className="adm-add">
                  + Agregar
                  <input type="file" accept="image/*" multiple hidden
                    onChange={e => { setAdded(a => [...a, ...Array.from(e.target.files)]); e.target.value = ""; }} />
                </label>
              </div>
            </div>
          </Form>
        )}
      </Modal>

      <Confirm
        open={ask}
        title="¿Eliminar este trabajo?"
        message="Se borrarán también sus fotos. Esta acción no se puede deshacer."
        busy={saving}
        onConfirm={remove}
        onCancel={() => setAsk(false)}
      />
    </section>
  );
}
