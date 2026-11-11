
export const WA_NUMBER = "5491140854870";
export const WA_DEFAULT = "Hola! Quisiera hacer una consulta por una reparación.";

export const waLink = (msg = WA_DEFAULT) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

export const APPLIANCES = [
  { icon: "📺", name: "Televisores LED y Smart", desc: "Reparamos TVs LED y Smart de todas las marcas.", issues: ["No enciende o se apaga solo", "Hay sonido pero no imagen", "Pantalla con líneas o retroiluminación que falla"] },
  { icon: "🫧", name: "Lavarropas", desc: "Automáticos y de carga superior.", issues: ["No centrifuga ni desagota", "Pierde agua", "No enciende o se traba el programa"] },
  { icon: "🌀", name: "Secarropas y secadoras", desc: "Que tu ropa vuelva a secar bien.", issues: ["No gira o no calienta", "Hace ruidos inusuales", "Se corta durante el ciclo"], feature: true },
  { icon: "🍽️", name: "Lavavajillas", desc: "Reparamos fugas, ruidos y mal lavado.", issues: ["Pierde agua", "No lava bien o deja vasos turbios", "No desagota"] },
  { icon: "🔥", name: "Cocinas y hornos", desc: "Solo fallas eléctricas.", issues: ["El horno eléctrico no calienta", "Encendido eléctrico o luz que no funciona", "Resistencia, termostato o timer dañados"] },
  { icon: "📡", name: "Microondas", desc: "Diagnóstico y reparación segura.", issues: ["No calienta", "Plato que no gira", "Chispas o ruidos"] },
  { icon: "🌬️", name: "Ventiladores", desc: "De pie, de techo y turbos.", issues: ["No enciende o no gira", "Velocidades que no responden", "Ruidos o motor que recalienta"] },
  { icon: "🚿", name: "Termotanques y calefones", desc: "Agua caliente sin vueltas.", issues: ["No calienta el agua", "Pérdidas", "Piloto que no queda encendido"] },
  { icon: "🔌", name: "Pequeños electrodomésticos", desc: "Licuadoras, cafeteras, planchas, aspiradoras y más.", issues: ["No enciende", "Cables o fichas dañadas", "Pérdida de potencia"] },
];

export const BRANDS = ["Samsung","LG","Whirlpool","Drean","Philco","Electrolux","Bosch","Patrick","Gafa","Longvie","Orbis","Frávega","Midea","BGH","Carrier","Candy"];
export const ROTATE = ["de televisores","de lavarropas","de cocinas","de planchitas","de microondas","de lo que sea"];
