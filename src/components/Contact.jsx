import { useState } from "react";
import { motion } from "motion/react";
import { APPLIANCES, waLink } from "../config.js";
import { reveal } from "../reveal.js";
import Select from "./Select.jsx";

export default function Contact() {
  const [form, setForm] = useState({ nombre: "", equipo: APPLIANCES[0].name, marca: "", problema: "" });
  const [error, setError] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.problema.trim()) return setError(true);
    setError(false);
    const marca = form.marca.trim();
    const msg = `Hola! Soy ${form.nombre.trim()}.\nEquipo: ${form.equipo}${marca ? ` (${marca})` : ""}\nProblema: ${form.problema.trim()}`;
    window.open(waLink(msg), "_blank", "noopener");
  };

  return (
    <section className="section cta" id="contacto">
      <div className="container contact">
        <div className="contact-text">
          <motion.h2 {...reveal()}>¿Se rompió algo? <br />Contanos y lo <span className="light">resolvemos.</span></motion.h2>
          <motion.p {...reveal(0.1)}>Completá el formulario y se abre WhatsApp con tu consulta lista para enviar. O escribinos directo.</motion.p>        </div>

        <motion.form className="form" onSubmit={submit} noValidate {...reveal(0.1)}>
          <label>Nombre
            <input value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
          </label>
          <div className="row">
            <Select
              label="Electrodoméstico"
              value={form.equipo}
              onChange={v => setForm(f => ({ ...f, equipo: v }))}
              options={[...APPLIANCES.map(a => a.name), "Otro"]}
            />
            <label>Marca
              <input value={form.marca} onChange={set("marca")} placeholder="Ej: Samsung, Drean…" />
            </label>
          </div>
          <label>¿Qué le pasa?
            <textarea rows="4" value={form.problema} onChange={set("problema")} placeholder="Ej: no enfría, hace ruido…" />
          </label>
          <motion.button className="btn btn-blue" type="submit" whileTap={{ scale: 0.97 }}>Enviar consulta por WhatsApp</motion.button>
          {error && <small className="err">Completá nombre y problema para continuar.</small>}
        </motion.form>
      </div>
    </section>
  );
}
