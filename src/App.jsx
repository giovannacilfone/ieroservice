import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Services from "./components/Services.jsx";
import Steps from "./components/Steps.jsx";
import Why from "./components/Why.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppIcon from "./components/WhatsAppIcon.jsx";
import { waLink } from "./config.js";

export default function App() {
  return (
    <>
      <Hero />
      <Marquee />
      <Services />
      <Steps />
      <Why />
      <Contact />
      <Footer />
      <a className="fab" href={waLink()} target="_blank" rel="noopener" aria-label="WhatsApp">
        <WhatsAppIcon size={32} />
      </a>
    </>
  );
}
