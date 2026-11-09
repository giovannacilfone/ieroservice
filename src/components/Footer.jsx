export default function Footer() {
  return (
    <footer className="footer">
      <div className="container foot">
        <span className="logo dark"><span>Iero <b>Service</b></span></span>
        <span>© {new Date().getFullYear()} Iero Service · Reparación de electrodomésticos</span>
      </div>
    </footer>
  );
}
