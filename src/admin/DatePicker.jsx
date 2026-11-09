import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Select from "../components/Select.jsx";

/**
 * Selector de fecha (y opcionalmente hora) propio, en lugar del nativo del navegador.
 * value: "YYYY-MM-DD"  (o "YYYY-MM-DDTHH:mm" con withTime). "" = sin valor.
 * El calendario se dibuja en <body> con position:fixed, así no lo recorta el modal.
 */
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; // fecha local, sin corrimientos de zona horaria
};
const parseTime = s => {
  const m = /T(\d{2}):(\d{2})/.exec(s || "");
  return m ? [m[1], m[2]] : null;
};
const DOW = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]; // formato corto fijo: "9 nov 2026"
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const HOURS = Array.from({ length: 24 }, (_, i) => ({ value: pad(i), label: pad(i) }));
const POP_W = 304;

const Chevron = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
  </svg>
);

export default function DatePicker({ value, onChange, withTime = false, ariaLabel, clearable = true }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [view, setView] = useState({ y: 0, m: 0 });
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const sel = parseDate(value);
  const time = parseTime(value) || ["09", "00"];
  const todayKey = keyOf(new Date());

  const emit = (date, t = time) => onChange(withTime ? `${keyOf(date)}T${t[0]}:${t[1]}` : keyOf(date));

  const place = () => {
    const r = btnRef.current.getBoundingClientRect();
    const need = withTime ? 430 : 360;
    const below = window.innerHeight - r.bottom - 12;
    const up = below < need && r.top > below;
    setPos({
      up,
      left: Math.max(8, Math.min(r.left, window.innerWidth - POP_W - 8)),
      top: up ? "auto" : r.bottom + 8,
      bottom: up ? window.innerHeight - r.top + 8 : "auto",
      maxHeight: Math.max(260, (up ? r.top : below) - 8),
    });
  };

  useEffect(() => {
    if (!open) return;
    const base = parseDate(value) || new Date();
    setView({ y: base.getFullYear(), m: base.getMonth() });
    place();

    const inside = t => btnRef.current?.contains(t) || popRef.current?.contains(t) || t.closest?.(".sel-list");
    const close = () => setOpen(false);
    const onScroll = e => { if (!inside(e.target)) close(); };
    const onDown = e => { if (!inside(e.target)) close(); };
    const onKey = e => {
      if (e.key !== "Escape" || document.querySelector(".sel-list")) return; // si hay una lista abierta, Esc cierra esa
      e.stopPropagation();
      close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]); // eslint-disable-line

  const go = delta => setView(({ y, m }) => {
    const d = new Date(y, m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  // 6 semanas, empezando en lunes
  const first = new Date(view.y, view.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(view.y, view.m, 1 - offset + i));

  const pickDay = d => { emit(d); if (!withTime) setOpen(false); };
  const today = () => {
    const d = new Date();
    emit(d);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    if (!withTime) setOpen(false);
  };
  const clear = () => { onChange(""); setOpen(false); };

  const minutes = Array.from({ length: 12 }, (_, i) => pad(i * 5));
  if (!minutes.includes(time[1])) minutes.push(time[1]);
  minutes.sort();

  const label = sel
    ? `${sel.getDate()} ${MONTHS[sel.getMonth()]} ${sel.getFullYear()}` + (withTime ? ` · ${time[0]}:${time[1]}` : "")
    : "";
  const monthName = cap(new Date(view.y, view.m, 1).toLocaleDateString("es-AR", { month: "long" }));

  return (
    <div className="sel">
      <button
        ref={btnRef}
        type="button"
        className={`sel-btn ${open ? "open" : ""} ${sel ? "" : "empty"}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(o => !o)}
      >
        <span className="sel-val">{label || (withTime ? "Elegir fecha y hora" : "Elegir fecha")}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              ref={popRef}
              className="dp-pop"
              role="dialog"
              aria-label="Calendario"
              style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, width: POP_W, maxHeight: pos.maxHeight }}
              initial={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
            >
              <div className="dp-head">
                <button type="button" className="dp-nav" onClick={() => go(-1)} aria-label="Mes anterior"><Chevron dir="left" /></button>
                <strong>{monthName} {view.y}</strong>
                <button type="button" className="dp-nav" onClick={() => go(1)} aria-label="Mes siguiente"><Chevron dir="right" /></button>
              </div>

              <div className="dp-grid dp-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
              <div className="dp-grid">
                {cells.map(d => {
                  const k = keyOf(d);
                  const cls = [
                    d.getMonth() !== view.m && "out",
                    k === todayKey && "today",
                    sel && k === keyOf(sel) && "on",
                  ].filter(Boolean).join(" ");
                  return <button key={k} type="button" className={cls} onClick={() => pickDay(d)}>{d.getDate()}</button>;
                })}
              </div>

              {withTime && (
                <div className="dp-time">
                  <span>Hora</span>
                  <Select bare ariaLabel="Hora" value={time[0]} options={HOURS}
                    onChange={h => emit(sel || new Date(), [h, time[1]])} />
                  <b>:</b>
                  <Select bare ariaLabel="Minutos" value={time[1]} options={minutes.map(m => ({ value: m, label: m }))}
                    onChange={m => emit(sel || new Date(), [time[0], m])} />
                </div>
              )}

              <div className="dp-foot">
                <div>
                  <button type="button" onClick={today}>Hoy</button>
                  {clearable && value && <button type="button" onClick={clear}>Borrar</button>}
                </div>
                {withTime && <button type="button" className="dp-ok" onClick={() => setOpen(false)}>Listo</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
