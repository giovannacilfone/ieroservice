import { motion } from "motion/react";
import { reveal } from "../reveal.js";

const STEPS = [
  ["Nos escribís", "Por WhatsApp o con el formulario. Contanos qué equipo es y qué falla tiene. Podés mandar fotos o video."],
  ["Revisión sin cargo", "La consulta y la revisión no tienen costo. Te orientamos sobre la falla y coordinamos la visita o el retiro del equipo en el día que te quede cómodo."],
  ["Reparación y garantía", "Arreglamos con repuestos de calidad y te dejamos el equipo funcionando, con garantía."],
];

export default function Steps() {
  return (
    <section className="section soft" id="proceso">
      <div className="container center">
        <motion.h2 {...reveal()}>Así de simple es <span className="blue">repararlo</span></motion.h2>
        <motion.p className="lead" {...reveal(0.1)}>Sin vueltas ni esperas largas.</motion.p>
      </div>
      <div className="container steps">
        {STEPS.map(([t, d], i) => (
          <motion.article className="step" key={t} {...reveal(i * 0.1)} whileHover={{ y: -6 }}>
            <span className="num">{i + 1}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
