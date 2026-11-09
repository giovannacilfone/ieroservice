import { BRANDS } from "../config.js";

export default function Marquee() {
  return (
    <section className="marquee" aria-label="Marcas">
      <div className="marquee-track">
        {[...BRANDS, ...BRANDS].map((b, i) => <span key={i}>{b}</span>)}
      </div>
    </section>
  );
}
