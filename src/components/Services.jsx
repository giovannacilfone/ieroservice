import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { APPLIANCES, waLink } from "../config.js";
import { reveal } from "../reveal.js";

function Card({ a, i }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.article
      className="card"
      style={{ rotateX, rotateY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.1 }}
    >
      <div className="ico">{a.icon}</div>
      <h3>{a.name}</h3>
      <p>{a.desc}</p>
      <ul>{a.issues.map(x => <li key={x}>{x}</li>)}</ul>
      <a className="more" target="_blank" rel="noopener"
         href={waLink(`Hola! Tengo un problema con mi ${a.name.toLowerCase()}. ¿Me pueden ayudar?`)}>
        Consultar por este equipo <i>→</i>
      </a>
    </motion.article>
  );
}

export default function Services() {
  return (
    <section className="section" id="servicios">
      <div className="container center">
        <motion.h2 {...reveal()}>Reparamos <span className="blue">todos</span> los electrodomésticos de tu hogar</motion.h2>
        <motion.p className="lead" {...reveal(0.1)}>Elegí tu equipo, mirá los problemas más comunes y consultanos directo. Si no lo ves en la lista, escribinos igual.</motion.p>
      </div>
      <div className="container grid">
        {APPLIANCES.map((a, i) => <Card key={a.name} a={a} i={i} />)}
      </div>
    </section>
  );
}
