// Props reutilizables: aparece suavemente al entrar en pantalla
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] },
});
