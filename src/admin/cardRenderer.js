// Dibuja la tarjeta de presentación (90×50 mm) en un <canvas> de 1800×1000 px (≈ 508 dpi).
// Concepto: "etiqueta de service" — perforación, borde punteado como costura y un sello de años de experiencia.
import { TECH, fmtPhone } from "./cardConfig.js";

export const W = 1800;
export const H = 1000;

const NAVY = "#0f1a33";
const BLUE = "#4f86f7";
const LIGHT = "#cfe0ff";
const FONT = "Poppins, system-ui, sans-serif";
const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

/* ---------- utilidades ---------- */
const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const newCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

// Texto con espaciado entre letras (compatible con todos los navegadores)
function spaced(ctx, text, x, y, spacing, align = "left") {
  const chars = [...text];
  const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : x;
  ctx.textAlign = "left";
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  return total;
}

export async function loadAssets() {
  await Promise.all([400, 500, 600, 700].map(w => document.fonts.load(`${w} 40px Poppins`)));
  return { pattern: await loadImage("/assets/patron-electro.svg") };
}

/* ---------- QR con módulos redondeados ---------- */
async function drawQR(ctx, text, x, y, size) {
  const mod = await import("qrcode");
  const QRCode = mod.default || mod;
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = modules.size;
  const cell = size / n;
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const rr = (rx, ry, w, h, r) => { ctx.beginPath(); ctx.roundRect(rx, ry, w, h, r); ctx.fill(); };

  ctx.fillStyle = NAVY;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isFinder(r, c) && modules.get(r, c)) rr(x + c * cell + cell * 0.05, y + r * cell + cell * 0.05, cell * 0.9, cell * 0.9, cell * 0.34);
    }
  }
  // Ojos de posición: anillo + centro, redondeados
  for (const [fr, fc] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    const fx = x + fc * cell, fy = y + fr * cell;
    ctx.fillStyle = NAVY;  rr(fx, fy, 7 * cell, 7 * cell, cell * 2.2);
    ctx.fillStyle = "#fff"; rr(fx + cell, fy + cell, 5 * cell, 5 * cell, cell * 1.5);
    ctx.fillStyle = "#1f4fd1"; rr(fx + 2 * cell, fy + 2 * cell, 3 * cell, 3 * cell, cell * 1.0);
  }
}

/* ---------- FRENTE ---------- */
function drawFront(ctx, { pattern }) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0a1226"); g.addColorStop(1, "#1d3566");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.6);
  glow.addColorStop(0, "rgba(79,134,247,.55)"); glow.addColorStop(1, "rgba(79,134,247,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Patrón de electrodomésticos (se atenúa donde va el texto)
  const p = ctx.createPattern(pattern, "repeat");
  p.setTransform(new DOMMatrix().scale(1.45));
  ctx.fillStyle = p; ctx.fillRect(0, 0, W, H);
  const fade = ctx.createLinearGradient(0, 0, W * 0.72, 0);
  fade.addColorStop(0, "rgba(10,18,38,.92)"); fade.addColorStop(0.7, "rgba(10,18,38,.7)"); fade.addColorStop(1, "rgba(10,18,38,0)");
  ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);

  // Costura punteada
  ctx.save();
  ctx.setLineDash([22, 18]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineCap = "round";
  ctx.beginPath(); ctx.roundRect(48, 48, W - 96, H - 96, 58); ctx.stroke();
  ctx.restore();

  // Perforación de la etiqueta
  const hx = 150, hy = 150;
  const hole = ctx.createRadialGradient(hx, hy - 10, 6, hx, hy, 62);
  hole.addColorStop(0, "#02050c"); hole.addColorStop(1, "#0b1530");
  ctx.fillStyle = hole; ctx.beginPath(); ctx.arc(hx, hy, 60, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(143,178,255,.5)";
  ctx.beginPath(); ctx.arc(hx, hy, 80, 0, Math.PI * 2); ctx.stroke();

  // Marca
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.fillStyle = "#fff"; ctx.font = `700 290px ${FONT}`;
  ctx.fillText("IERO", 140, 640);
  ctx.fillStyle = "#8fb2ff"; ctx.font = `500 90px ${FONT}`;
  spaced(ctx, "SERVICE", 152, 765, 36);

  ctx.fillStyle = BLUE; ctx.beginPath(); ctx.roundRect(152, 812, 150, 11, 6); ctx.fill();
  ctx.fillStyle = LIGHT; ctx.font = `400 48px ${FONT}`;
  ctx.fillText("Reparación de electrodomésticos", 152, 905);
}

/* ---------- DORSO ---------- */
async function drawBack(ctx, { url }) {
  ctx.fillStyle = "#f4f7fd"; ctx.fillRect(0, 0, W, H);

  // Costura punteada
  ctx.save();
  ctx.setLineDash([22, 18]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(15,26,51,.16)"; ctx.lineCap = "round";
  ctx.beginPath(); ctx.roundRect(48, 48, W - 96, H - 96, 58); ctx.stroke();
  ctx.restore();

  // Panel azul con el QR
  const px = 1010, py = 90, pw = 690, ph = 820;
  const pg = ctx.createLinearGradient(px, py, px + pw, py + ph);
  pg.addColorStop(0, "#1d3566"); pg.addColorStop(1, "#3b6fe0");
  ctx.save();
  ctx.shadowColor = "rgba(40,70,140,.35)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 60); ctx.fill();
  ctx.restore();

  const qs = 470, qx = px + (pw - qs) / 2, qy = py + 80;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(qx - 34, qy - 34, qs + 68, qs + 68, 44); ctx.fill();
  await drawQR(ctx, url, qx, qy, qs);

  ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = `700 54px ${FONT}`;
  ctx.fillText("Escaneá y consultá", px + pw / 2, py + ph - 150);
  ctx.fillStyle = LIGHT; ctx.font = `400 36px ${FONT}`;
  ctx.fillText("Consulta y revisión sin cargo", px + pw / 2, py + ph - 88);

  // Datos del técnico
  ctx.textAlign = "left";
  ctx.fillStyle = BLUE; ctx.font = `600 32px ${FONT}`;
  spaced(ctx, "TÉCNICO", 130, 215, 12);
  ctx.fillStyle = NAVY; ctx.font = `700 128px ${FONT}`;
  ctx.fillText(TECH.name[0], 124, 360);
  ctx.fillText(TECH.name[1], 124, 492);
  ctx.fillStyle = "#5b6478"; ctx.font = `400 44px ${FONT}`;
  ctx.fillText(TECH.role, 130, 575);

  ctx.fillStyle = "rgba(15,26,51,.12)"; ctx.fillRect(130, 640, 140, 5);

  // Teléfono con ícono de WhatsApp
  ctx.fillStyle = "#25d366"; ctx.beginPath(); ctx.arc(190, 790, 58, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(190 - 30, 790 - 30); ctx.scale(60 / 24, 60 / 24); ctx.fillStyle = "#fff"; ctx.fill(new Path2D(WA_PATH)); ctx.restore();
  ctx.fillStyle = "#5b6478"; ctx.font = `400 34px ${FONT}`;
  ctx.fillText("WhatsApp · Llamadas", 280, 752);
  ctx.fillStyle = NAVY; ctx.font = `700 80px ${FONT}`;
  ctx.fillText(fmtPhone(TECH.phone), 278, 826);

  // Sello "20+ años" pegado sobre el borde del panel
  const sx = px + 6, sy = py + 20;
  ctx.save();
  ctx.translate(sx, sy); ctx.rotate(-0.2);
  ctx.shadowColor = "rgba(15,26,51,.35)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, 118, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = BLUE; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = "center"; ctx.fillStyle = NAVY; ctx.font = `700 84px ${FONT}`;
  ctx.fillText(`${TECH.years}+`, 0, 20);
  ctx.fillStyle = BLUE; ctx.font = `600 29px ${FONT}`;
  spaced(ctx, "AÑOS", 0, 62, 8, "center");
  ctx.restore();
}

/* ---------- API ---------- */
export async function renderSide(side, assets, url) {
  const c = newCanvas(W, H);
  const ctx = c.getContext("2d");
  if (side === "front") drawFront(ctx, assets); else await drawBack(ctx, { url });
  return c;
}

// Una sola imagen con las dos caras (para compartir por WhatsApp)
export async function renderBoth(assets, url) {
  const [f, b] = await Promise.all([renderSide("front", assets, url), renderSide("back", assets, url)]);
  const m = 90, gap = 70;
  const c = newCanvas(W + m * 2, H * 2 + gap + m * 2);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#e9eef9"; ctx.fillRect(0, 0, c.width, c.height);
  for (const [img, y] of [[f, m], [b, m + H + gap]]) {
    ctx.save();
    ctx.shadowColor = "rgba(40,70,140,.35)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    ctx.beginPath(); ctx.roundRect(m, y, W, H, 58); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(m, y, W, H, 58); ctx.clip(); ctx.drawImage(img, m, y); ctx.restore();
  }
  return c;
}
