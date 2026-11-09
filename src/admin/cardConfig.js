// Datos de la tarjeta de presentación (editá acá si cambian)
export const TECH = {
  name: ["Roberto", "Ieronimo"],
  role: "Técnico en electrodomésticos",
  phone: "1149854870",
  years: 20,
};

export const fmtPhone = p => {
  const d = String(p).replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 2)} ${d.slice(2, 6)}-${d.slice(6)}` : d;
};
