import { useEffect, useRef, useState } from "react";
import { H, W, loadAssets, renderBoth, renderSide } from "./cardRenderer.js";
import { TECH, fmtPhone } from "./cardConfig.js";

const KEY = "iero_card_url";
const initialUrl = () => {
  try { return localStorage.getItem(KEY) || window.location.origin; } catch { return window.location.origin; }
};

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const toBlob = canvas => new Promise(res => canvas.toBlob(res, "image/png"));

export default function Card() {
  const [url, setUrl] = useState(initialUrl);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const front = useRef(null);
  const back = useRef(null);
  const assets = useRef(null);

  const valid = /^https?:\/\/\S+$/i.test(url.trim());

  // Redibuja las dos caras cuando cambia el link (con una pausa mientras se escribe)
  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        assets.current ||= await loadAssets();
        const [f, b] = await Promise.all([renderSide("front", assets.current, url.trim()), renderSide("back", assets.current, url.trim())]);
        if (cancelled) return;
        front.current.getContext("2d").drawImage(f, 0, 0);
        back.current.getContext("2d").drawImage(b, 0, 0);
        setReady(true);
      } catch (e) { console.error(e); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [url, valid]);

  const onUrl = v => {
    setUrl(v);
    try { localStorage.setItem(KEY, v); } catch { /* sin almacenamiento: no pasa nada */ }
  };

  const save = async (canvas, name) => download(await toBlob(canvas), name);

  // En el celular abre el menú de compartir (WhatsApp, etc.); en la compu descarga la imagen
  const shareBoth = async () => {
    setBusy(true);
    try {
      const blob = await toBlob(await renderBoth(assets.current, url.trim()));
      const file = new File([blob], "tarjeta-iero-service.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${TECH.name.join(" ")} · Iero Service` });
      } else {
        download(blob, "tarjeta-iero-service.png");
      }
    } catch (e) {
      if (e?.name !== "AbortError") console.error(e);
    }
    setBusy(false);
  };

  const disabled = !ready || !valid || busy;

  return (
    <section>
      <header className="adm-head"><h1>Tarjeta de presentación</h1></header>

      <div className="adm-card adm-cardbox">
        <label className="adm-field">
          <span>Link que abre el QR</span>
          <input value={url} onChange={e => onUrl(e.target.value)} placeholder="https://tusitio.com" inputMode="url" />
        </label>
        {!valid && <p className="adm-error">Escribí un link que empiece con https://</p>}
        <p className="adm-hint">
          {TECH.name.join(" ")} · {fmtPhone(TECH.phone)} · Tamaño 90 × 50 mm ({W} × {H} px, listo para imprenta).
        </p>

        <div className="adm-cardprev">
          <figure><canvas ref={front} width={W} height={H} aria-label="Frente de la tarjeta" /><figcaption>Frente</figcaption></figure>
          <figure><canvas ref={back} width={W} height={H} aria-label="Dorso de la tarjeta" /><figcaption>Dorso</figcaption></figure>
        </div>

        <div className="adm-cardbtns">
          <button className="adm-btn primary" disabled={disabled} onClick={shareBoth}>Compartir / descargar ambas</button>
          <button className="adm-btn" disabled={disabled} onClick={() => save(front.current, "tarjeta-iero-service-frente.png")}>Descargar frente</button>
          <button className="adm-btn" disabled={disabled} onClick={() => save(back.current, "tarjeta-iero-service-dorso.png")}>Descargar dorso</button>
        </div>
      </div>
    </section>
  );
}
