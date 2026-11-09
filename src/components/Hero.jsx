import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, animate } from "motion/react";
import { ROTATE, waLink } from "../config.js";
import { reveal } from "../reveal.js";

function Count({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.4, ease: "easeOut", onUpdate: v => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <strong ref={ref}>{n.toLocaleString("es-AR")}</strong>;
}

function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % ROTATE.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="rotator">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
        >
          {ROTATE[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["#servicios", "Qué reparamos"], ["#proceso", "Cómo trabajamos"], ["#nosotros", "Por qué elegirnos"], ["#contacto", "Contacto"]];
  return (
    <motion.nav className="nav" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
      <a href="#inicio" className="logo"><span>Iero <b>Service</b></span></a>
      <button className="burger" onClick={() => setOpen(o => !o)} aria-label="Menú"><span /><span /></button>
      <ul className={`nav-links ${open ? "open" : ""}`}>
        {links.map(([href, label]) => (
          <li key={href}><a href={href} onClick={() => setOpen(false)}>{label}</a></li>
        ))}
      </ul>
      <a className="btn btn-ghost nav-cta" href={waLink()} target="_blank" rel="noopener">Escribinos por WhatsApp</a>
    </motion.nav>
  );
}

const float = (dist, dur, delay = 0) => ({
  animate: { y: [0, -dist, 0] },
  transition: { duration: dur, delay, repeat: Infinity, ease: "easeInOut" },
});

function Visual() {
  return (
    <div className="hero-visual">
      <motion.div className="orb" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }} />
      <div className="ring" />
      <motion.div style={{ position: "absolute", inset: 0 }} {...float(12, 6)}>
        <motion.img
          className="hero-img"
          src="/assets/electrodomesticos.png"
          alt="Heladera, lavarropas, cocina, secadora y lavavajillas"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <header className="hero-wrap">
      <section className="hero" id="inicio" ref={ref}>
        <motion.div className="hero-bg" style={{ y }} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: "easeOut" }} />
        <div className="hero-shade" />
        <Nav />

        <div className="hero-body">
        <div className="hero-content">
          <motion.span className="pill" {...reveal(0)}><i className="dot" /> Atendemos hoy · Respuesta en minutos</motion.span>
          <motion.h1 {...reveal(0.1)}>Reparación <Rotator /><br />rápida y de confianza</motion.h1>
          <motion.p {...reveal(0.2)}>Diagnosticamos y reparamos todo tipo de electrodomésticos, de las marcas que ya tenés en casa. Contanos qué le pasa y te respondemos por WhatsApp.</motion.p>
          <motion.div className="hero-actions" {...reveal(0.3)}>
            <motion.a className="btn btn-white" href={waLink()} target="_blank" rel="noopener" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Consultar por WhatsApp
            </motion.a>
            <a className="btn btn-ghost" href="#servicios">Ver qué reparamos ↓</a>
          </motion.div>
          <motion.ul className="hero-stats" {...reveal(0.4)}>
            <li><Count to={20} />+ años de experiencia</li>
            <li><Count to={3000} />+ equipos reparados</li>
            <li><strong>30 días</strong> de garantía</li>
          </motion.ul>
        </div>
        <Visual />
        </div>
      </section>
    </header>
  );
}
