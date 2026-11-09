
export const WA_NUMBER = "5491140854870";
export const WA_DEFAULT = "Hola! Quisiera hacer una consulta por una reparación.";

export const waLink = (msg = WA_DEFAULT) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

export const APPLIANCES = [
  { icon: "🧊", name: "Heladeras y freezers", desc: "Volvemos a poner tu heladera a enfriar.", issues: ["No enfría o no congela", "Pierde agua o hace hielo de más", "Ruidos fuertes o motor que no corta"] },
  { icon: "🫧", name: "Lavarropas", desc: "Automáticos y de carga superior.", issues: ["No centrifuga ni desagota", "Pierde agua", "No enciende o se traba el programa"] },
  { icon: "🌀", name: "Secarropas y secadoras", desc: "Que tu ropa vuelva a secar bien.", issues: ["No gira o no calienta", "Hace ruidos inusuales", "Se corta durante el ciclo"], feature: true },
  { icon: "🍽️", name: "Lavavajillas", desc: "Reparamos fugas, ruidos y mal lavado.", issues: ["Pierde agua", "No lava bien o deja vasos turbios", "No desagota"] },
  { icon: "🔥", name: "Cocinas y hornos", desc: "A gas, eléctricos y anafes.", issues: ["No enciende o no calienta parejo", "Pérdidas o olor a gas", "Termostato o perillas rotas"] },
  { icon: "📡", name: "Microondas", desc: "Diagnóstico y reparación segura.", issues: ["No calienta", "Plato que no gira", "Chispas o ruidos"] },
  { icon: "❄️", name: "Aires acondicionados", desc: "Service, carga de gas y reparación.", issues: ["No enfría ni calefacciona", "Pierde agua", "Ruidos o mal olor"] },
  { icon: "🚿", name: "Termotanques y calefones", desc: "Agua caliente sin vueltas.", issues: ["No calienta el agua", "Pérdidas", "Piloto que no queda encendido"] },
  { icon: "🔌", name: "Pequeños electrodomésticos", desc: "Licuadoras, cafeteras, planchas, aspiradoras y más.", issues: ["No enciende", "Cables o fichas dañadas", "Pérdida de potencia"] },
];

export const BRANDS = ["Samsung","LG","Whirlpool","Drean","Philco","Electrolux","Bosch","Patrick","Gafa","Longvie","Orbis","Frávega","Midea","BGH","Carrier","Candy"];
export const ROTATE = ["de heladeras","de lavarropas","de cocinas","de planchitas","de microondas","de lo que sea"];
