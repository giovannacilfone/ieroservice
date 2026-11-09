import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const norm = o => (typeof o === "string" ? { value: o, label: o } : o);
const MAX_H = 268;

/**
 * Selector propio (reemplaza al <select> nativo).
 * options: ["a", "b"] o [{ value, label }]
 * bare: sin etiqueta propia (la pone quien lo usa)
 * La lista se dibuja en <body> con position:fixed para que ningún contenedor con scroll la recorte.
 */
export default function Select({ label, ariaLabel, value, onChange, options, bare = false }) {
  const opts = options.map(norm);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();

  const current = opts.find(o => o.value === value);
  const empty = !current || current.value === "";

  const place = () => {
    const r = btnRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 16;
    const need = Math.min(MAX_H, opts.length * 42 + 14);
    const up = below < need && r.top > below;
    setPos({
      up,
      left: r.left,
      width: r.width,
      top: up ? "auto" : r.bottom + 8,
      bottom: up ? window.innerHeight - r.top + 8 : "auto",
      maxHeight: Math.max(140, Math.min(MAX_H, (up ? r.top : below) - 8)),
    });
  };

  // Al abrir: posicionar, resaltar la opción elegida y cerrar si se hace scroll/resize/click afuera
  useEffect(() => {
    if (!open) return;
    place();
    setActive(Math.max(0, opts.findIndex(o => o.value === value)));
    const close = () => setOpen(false);
    const onScroll = e => { if (!listRef.current?.contains(e.target)) close(); };
    const onDown = e => {
      if (!btnRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]); // eslint-disable-line

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open, pos]);

  const choose = v => { onChange(v); setOpen(false); btnRef.current?.focus(); };

  const onKeyDown = e => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, opts.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(opts.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(opts[active].value); }
    else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  };

  const button = (
    <button
      ref={btnRef}
      type="button"
      className={`sel-btn ${open ? "open" : ""} ${empty ? "empty" : ""}`}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-label={bare ? ariaLabel : undefined}
      aria-labelledby={bare ? undefined : `${id}-l`}
      onClick={() => setOpen(o => !o)}
      onKeyDown={onKeyDown}
    >
      <span className="sel-val">{current ? current.label : ""}</span>
      <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
        <path d="m6 9 6 6 6-6" />
      </motion.svg>
    </button>
  );

  const list = (
    <AnimatePresence>
      {open && pos && (
        <motion.ul
          ref={listRef}
          className="sel-list"
          role="listbox"
          style={{ position: "fixed", left: pos.left, width: pos.width, right: "auto", top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight, zIndex: 400 }}
          initial={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
          transition={{ duration: 0.16 }}
        >
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`${i === active ? "active" : ""} ${o.value === value ? "chosen" : ""} ${o.value === "" ? "none" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => { e.preventDefault(); choose(o.value); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
              )}
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );

  return (
    <div className={bare ? "sel" : "field sel"}>
      {!bare && <span id={`${id}-l`}>{label}</span>}
      {button}
      {createPortal(list, document.body)}
    </div>
  );
}
