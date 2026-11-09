import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Select({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);
  const id = useId();

  // Cierra al hacer click afuera
  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Al abrir, resalta la opción elegida
  useEffect(() => {
    if (open) setActive(Math.max(0, options.indexOf(value)));
  }, [open]); // eslint-disable-line

  // Mantiene la opción activa visible al navegar con teclado
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = v => { onChange(v); setOpen(false); };

  const onKeyDown = e => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(options[active]); }
    else if (e.key === "Escape") { setOpen(false); }
    else if (e.key === "Tab") { setOpen(false); }
  };

  return (
    <div className="field sel" ref={ref}>
      <span id={`${id}-l`}>{label}</span>
      <button
        type="button"
        className={`sel-btn ${open ? "open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-l`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="sel-val">{value}</span>
        <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            className="sel-list"
            role="listbox"
            aria-labelledby={`${id}-l`}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {options.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                className={`${i === active ? "active" : ""} ${o === value ? "chosen" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={e => { e.preventDefault(); choose(o); }}
              >
                {o}
                {o === value && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
