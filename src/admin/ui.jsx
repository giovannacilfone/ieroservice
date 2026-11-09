import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import WhatsAppIcon from "../components/WhatsAppIcon.jsx";
import Select from "../components/Select.jsx";
import DatePicker from "./DatePicker.jsx";
import { waUrl } from "../lib/phone.js";

/* ---------- tooltip ---------- */
// Se dibuja en <body> con position:fixed para que no lo recorte la tabla con scroll.
// Sin `always`, solo aparece si el texto está realmente cortado.
export function Tip({ text, always = false, className, style, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const tipRef = useRef(null);

  // Antes de pintar: si el cuadro se saldría de la pantalla, lo corre; la flecha sigue apuntando al elemento
  useLayoutEffect(() => {
    const t = tipRef.current;
    if (!t || !pos) return;
    const half = t.offsetWidth / 2;
    const left = Math.min(Math.max(pos.x, half + 8), window.innerWidth - half - 8);
    t.style.left = left + "px";
    t.style.setProperty("--ax", (pos.x - left) + "px");
  }, [pos]);

  const show = () => {
    const el = ref.current;
    if (!el || !text) return;
    if (!always && el.scrollWidth <= el.clientWidth) return;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const below = r.top < 110;
    setPos({ x, y: below ? r.bottom : r.top, below });
  };
  const hide = () => setPos(null);

  return (
    <>
      <span ref={ref} className={className} style={style}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
        {children}
      </span>
      {pos && createPortal(
        <div ref={tipRef} className={`adm-tip ${pos.below ? "below" : ""}`} style={{ left: pos.x, top: pos.y }} role="tooltip">{text}</div>,
        document.body
      )}
    </>
  );
}

// Texto en una línea con "…" y tooltip con el contenido completo
export const Trunc = ({ text, max = 260 }) => (
  <Tip text={text} className="adm-trunc" style={{ maxWidth: max }}>{text || "—"}</Tip>
);

/* ---------- WhatsApp ---------- */
export function WaButton({ phone, text }) {
  const href = waUrl(phone, text);
  if (!href) return null;
  return (
    <Tip text={`WhatsApp · ${phone}`} always className="adm-wa-wrap">
      <a className="adm-wa" href={href} target="_blank" rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp" onClick={e => e.stopPropagation()}>
        <WhatsAppIcon size={15} />
      </a>
    </Tip>
  );
}

export const PhoneCell = ({ phone }) =>
  phone ? <span className="adm-phone">{phone}<WaButton phone={phone} /></span> : "—";

/* ---------- fechas ---------- */
export const fmtDateTime = iso =>
  iso ? new Date(iso).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" }) : "—";
export const fmtDate = d =>
  d ? new Date(d + (d.length === 10 ? "T00:00" : "")).toLocaleDateString("es-AR", { dateStyle: "medium" }) : "—";
// ISO → valor para <input type="datetime-local"> en hora local
const toLocalInput = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/* ---------- modal ---------- */
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="adm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="adm-modal"
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="adm-modal-head">
              <h3>{title}</h3>
              <button type="button" className="adm-x" onClick={onClose} aria-label="Cerrar">×</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- formulario genérico ---------- */
const initValues = (fields, initial = {}) =>
  Object.fromEntries(fields.map(f => {
    const v = initial[f.key];
    if (f.type === "datetime") return [f.key, f.timeless ? toLocalInput(v).slice(0, 10) : toLocalInput(v)];
    if (f.type === "checkbox") return [f.key, !!v];
    const def = typeof f.default === "function" ? f.default() : f.default;
    return [f.key, v ?? (def ?? "")];
  }));

const cleanValues = (fields, v) =>
  Object.fromEntries(fields.map(f => {
    const x = v[f.key];
    // Sin hora: se guarda a las 12:00 locales para que la zona horaria nunca cambie el día
    if (f.type === "datetime") return [f.key, x ? new Date(x.length === 10 ? x + "T12:00" : x).toISOString() : null];
    if (f.type === "number") return [f.key, x === "" ? null : Number(x)];
    if (f.type === "checkbox") return [f.key, !!x];
    if (f.type === "date") return [f.key, x || null];
    if (typeof x === "string") { const t = x.trim(); return [f.key, t === "" ? (f.required ? t : null) : t]; }
    return [f.key, x];
  }));

export function Form({ fields, initial, clients = [], onSubmit, onDelete, saving, error, children, submitLabel = "Guardar" }) {
  const [v, setV] = useState(() => initValues(fields, initial));
  const [localErr, setLocalErr] = useState("");
  const set = (k, val) => setV(s => ({ ...s, [k]: val }));

  return (
    <form className="adm-form" onSubmit={e => {
      e.preventDefault();
      // El selector de fecha no es un <input>, así que valido los obligatorios acá
      const missing = fields.find(f => (f.type === "date" || f.type === "datetime") && f.required && !v[f.key]);
      if (missing) return setLocalErr(`Elegí: ${missing.label.toLowerCase()}.`);
      setLocalErr("");
      onSubmit(cleanValues(fields, v));
    }}>
      <div className="adm-fields">
        {fields.map(f => f.type === "date" || f.type === "datetime" ? (
          <div key={f.key} className={`adm-field ${f.wide ? "wide" : ""} ${f.span ? `span-${f.span}` : ""}`}>
            <span>{f.label}{f.required && " *"}</span>
            <DatePicker
              ariaLabel={f.label}
              withTime={f.type === "datetime" && !f.timeless}
              clearable={!f.required}
              value={v[f.key]}
              onChange={val => set(f.key, val)}
            />
          </div>
        ) : f.type === "select" || f.type === "client" ? (
          // Selector propio (no <label>, para que el click en el texto no dispare el botón)
          <div key={f.key} className={`adm-field ${f.wide ? "wide" : ""} ${f.span ? `span-${f.span}` : ""}`}>
            <span>{f.label}{f.required && " *"}</span>
            <Select
              bare
              ariaLabel={f.label}
              value={v[f.key]}
              onChange={val => set(f.key, val)}
              options={f.type === "client"
                ? [{ value: "", label: "Sin cliente (asignar después)" }, ...clients.map(c => ({ value: c.id, label: c.name }))]
                : f.options.map(o => ({ value: o, label: o.charAt(0).toUpperCase() + o.slice(1) }))}
            />
          </div>
        ) : (
          <label key={f.key} className={`adm-field ${f.wide || f.type === "textarea" ? "wide" : ""} ${f.type === "checkbox" ? "check" : ""} ${f.span ? `span-${f.span}` : ""}`}>
            <span>{f.label}{f.required && " *"}</span>
            {f.type === "textarea" ? (
              <textarea rows={f.rows || 3} value={v[f.key]} required={f.required} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
            ) : f.type === "checkbox" ? (
              <input type="checkbox" checked={v[f.key]} onChange={e => set(f.key, e.target.checked)} />
            ) : (
              <input
                type={f.type === "datetime" ? "datetime-local" : f.type || "text"}
                step={f.type === "number" ? "any" : undefined}
                value={v[f.key]}
                required={f.required}
                placeholder={f.placeholder}
                onChange={e => set(f.key, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      {children}
      {(localErr || error) && <p className="adm-error">{localErr || error}</p>}
      <div className="adm-actions">
        {onDelete && <button type="button" className="adm-btn danger" onClick={onDelete} disabled={saving}>Eliminar</button>}
        <button type="submit" className="adm-btn primary" disabled={saving}>{saving ? "Guardando…" : submitLabel}</button>
      </div>
    </form>
  );
}

export const Badge = ({ children, tone = "gray" }) => <span className={`adm-badge ${tone}`}>{children}</span>;

export const STATUS_TONE = { pendiente: "amber", confirmada: "blue", realizada: "green", cancelada: "gray" };

/* ---------- confirmación (reemplaza a window.confirm) ---------- */
export function Confirm({ open, title, message, confirmLabel = "Eliminar", busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus(); // foco en "Cancelar": evita borrar por un Enter accidental
    // En fase de captura para que Esc cierre solo este diálogo y no la ventana de edición de abajo
    const onKey = e => { if (e.key === "Escape") { e.stopPropagation(); onCancel(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="adm-overlay top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={busy ? undefined : onCancel}>
          <motion.div
            className="adm-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="adm-confirm-t"
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="adm-confirm-ico">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v5M14 11v5" />
              </svg>
            </div>
            <h3 id="adm-confirm-t">{title}</h3>
            <p>{message}</p>
            <div className="adm-confirm-actions">
              <button ref={cancelRef} type="button" className="adm-btn" onClick={onCancel} disabled={busy}>Cancelar</button>
              <button type="button" className="adm-btn solid-danger" onClick={onConfirm} disabled={busy}>{busy ? "Eliminando…" : confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
