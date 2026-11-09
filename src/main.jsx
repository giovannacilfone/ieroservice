import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.jsx";
import "./styles.css";

// El panel se carga aparte: la web pública no descarga nada de su código.
const Admin = lazy(() => import("./admin/Admin.jsx"));
const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      {isAdmin ? (
        <Suspense fallback={null}>
          <Admin />
        </Suspense>
      ) : (
        <App />
      )}
    </MotionConfig>
  </StrictMode>
);
