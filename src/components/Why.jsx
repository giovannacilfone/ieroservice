import { useState } from "react";
import { motion } from "motion/react";
import { waLink } from "../config.js";
import { reveal } from "../reveal.js";

const ITEMS = [
  "Hablás directo con quien repara tu equipo",
  "Consulta y revisión sin cargo",
  "Presupuesto claro antes de empezar",
  "Repuestos de calidad y garantía",
  "Todas las marcas, nuevos y viejos modelos",
];

const float = (dist, dur, delay = 0) => ({
  animate: { y: [0, -dist, 0] },
  transition: { duration: dur, delay, repeat: Infinity, ease: "easeInOut" },
});

function Chip({ cls, icon, title, sub, delay, f }) {
  return (
    <motion.div
      className={`chip ${cls}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
    >
      <motion.div style={{ display: "flex", gap: ".6rem", alignItems: "center" }} {...float(...f)}>
        <span>{icon}</span>
        <div>{title}<small>{sub}</small></div>
      </motion.div>
    </motion.div>
  );
}

// Si existe public/assets/tecnico.jpg se muestra la foto; si no, el panel con datos.
function Panel() {
  const [photo, setPhoto] = useState(true);
  return (
    <motion.div className={`why-panel${photo ? " has-photo" : ""}`} {...reveal()}>
      {photo ? (
        <img
          className="why-photo"
          src="/assets/tecnico.jpg"
          alt="Técnico de Iero Service"
          onError={() => setPhoto(false)}
        />
      ) : (
        <>
          <div className="why-ring" />
          <motion.div className="why-orb" initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}>
            <motion.div {...float(8, 6)}>
              <strong>20+</strong>
              <span>años de experiencia</span>
            </motion.div>
          </motion.div>
          <Chip cls="w1" icon="✅" title="Consulta sin cargo" sub="Revisión sin compromiso" delay={0.3} f={[8, 5]} />
          <Chip cls="w2" icon="🛠️" title="Todas las marcas" sub="Nuevos y viejos modelos" delay={0.5} f={[10, 6, 0.8]} />
          <Chip cls="w3" icon="⚡" title="Respuesta rápida" sub="Por WhatsApp" delay={0.7} f={[8, 5.5, 1.5]} />
        </>
      )}
    </motion.div>
  );
}

export default function Why() {
  return (
    <section className="section" id="nosotros">
      <div className="container why">
        <Panel />
        <div>
          <motion.h2 {...reveal()}>Un técnico <span className="blue">de confianza</span>, sin intermediarios</motion.h2>
          <ul className="checks">
            {ITEMS.map((t, i) => <motion.li key={t} {...reveal(i * 0.1)}>{t}</motion.li>)}
          </ul>
          <motion.a className="btn btn-blue" href={waLink()} target="_blank" rel="noopener" {...reveal(0.4)}>
            Hablar con el técnico
          </motion.a>
        </div>
      </div>
    </section>
  );
}
