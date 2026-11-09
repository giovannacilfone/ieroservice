// Convierte un teléfono cargado a mano en un link de chat de WhatsApp (wa.me).
// Acepta formatos argentinos habituales:
//   1123882616 · 011 2388-2616 · 011 15 2388-2616 · +54 11 2388 2616 · 5491123882616
// Si el número no parece argentino (ej. ya trae otro código de país), se usa tal cual.
export function waUrl(phone, text) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.length < 8) return null;

  d = d.replace(/^00/, "");

  if (d.startsWith("54")) {
    // +54 11 xxxx xxxx (sin el 9 de celular) → agrega el 9
    if (!d.startsWith("549") && d.length === 12) d = "549" + d.slice(2);
  } else if (d.length <= 11 || d.startsWith("0")) {
    d = d.replace(/^0/, "");
    // quita el "15" de celular que va después del código de área: 11 15 2388 2616 → 11 2388 2616
    if (d.length === 12) {
      for (const i of [2, 3, 4]) {
        if (d.slice(i, i + 2) === "15") { d = d.slice(0, i) + d.slice(i + 2); break; }
      }
    }
    if (d.length === 10) d = "549" + d;
  }

  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
