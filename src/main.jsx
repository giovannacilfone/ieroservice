import { StrictMode } from "react";
// import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.jsx";
import "./styles.css";

// ── Panel admin DESACTIVADO ──────────────────────────────────────────────
// Por ahora no hay conexión con el backend (Supabase), así que el panel está
// apagado y solo se muestra la web pública. El código sigue en src/admin/
// y src/lib/supabase.js. Para reactivarlo, descomentá estas líneas y el
// bloque de abajo (y el import de Suspense/lazy de arriba).
//
// // El panel se carga aparte: la web pública no descarga nada de su código.
// const Admin = lazy(() => import("./admin/Admin.jsx"));
// const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {/* Panel admin desactivado:
      {isAdmin ? (
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      ) : (
        <App />
      )}
      */}
      <App />
    </MotionConfig>
  </StrictMode>
);
