import { Badge, PhoneCell, STATUS_TONE, Trunc, WaButton, fmtDate, fmtDateTime } from "./ui.jsx";

export const CLIENTS = {
  table: "clients",
  title: "Clientes",
  singular: "cliente",
  order: { column: "name", ascending: true },
  fields: [
    { key: "name", label: "Nombre", required: true },
    { key: "phone", label: "Teléfono / WhatsApp", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Dirección" },
    { key: "notes", label: "Notas", type: "textarea" },
  ],
  columns: [
    { label: "Nombre", render: r => <strong>{r.name}</strong> },
    { label: "Dirección", render: r => <Trunc text={r.address} max={220} /> },
    { label: "Notas", render: r => <Trunc text={r.notes} max={280} /> },
    { label: "WhatsApp", cls: "adm-actioncell", stop: true, render: r => <WaButton phone={r.phone} /> },
  ],
};

export const PROVIDERS = {
  table: "providers",
  title: "Proveedores",
  singular: "proveedor",
  order: { column: "name", ascending: true },
  fields: [
    { key: "name", label: "Nombre / Empresa", required: true },
    { key: "category", label: "Rubro", placeholder: "Ej: Repuestos, gas, motores…" },
    { key: "phone", label: "Teléfono", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Dirección", wide: true, placeholder: "Calle, número, localidad" },
    { key: "notes", label: "Notas", type: "textarea" },
  ],
  columns: [
    { label: "Nombre", render: r => <strong>{r.name}</strong> },
    { label: "Rubro", render: r => (r.category ? <Badge tone="blue">{r.category}</Badge> : "—") },
    { label: "Teléfono", render: r => <PhoneCell phone={r.phone} /> },
    { label: "Dirección", render: r => <Trunc text={r.address} max={220} /> },
    { label: "Notas", render: r => <Trunc text={r.notes} max={240} /> },
  ],
};

export const VISITS = {
  table: "visits",
  title: "Visitas",
  singular: "visita",
  fem: true,
  order: { column: "scheduled_at", ascending: true },
  fields: [
    { key: "scheduled_at", label: "Fecha", type: "datetime", timeless: true, required: true },
    { key: "status", label: "Estado", type: "select", options: ["pendiente", "confirmada", "realizada", "cancelada"], default: "pendiente" },
    { key: "client_id", label: "Cliente", type: "client", wide: true },
    { key: "appliance", label: "Electrodoméstico" },
    { key: "address", label: "Dirección" },
    { key: "notes", label: "Problema y notas", type: "textarea", rows: 5, placeholder: "Describí el problema y dejá las anotaciones que quieras…" },
  ],
  columns: [
    { label: "Fecha", render: r => <strong>{fmtDate(r.scheduled_at)}</strong> },
    {
      label: "Cliente",
      render: (r, c) => {
        const cl = c.clientsById[r.client_id];
        return cl ? <span className="adm-phone">{cl.name}<WaButton phone={cl.phone} /></span> : "—";
      },
    },
    { label: "Equipo", render: r => r.appliance || "—" },
    { label: "Dirección", render: r => <Trunc text={r.address} max={200} /> },
    { label: "Detalle", render: r => <Trunc text={r.notes} max={240} /> },
    { label: "Estado", render: r => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
  ],
  tabs: [
    { label: "Próximas", filter: r => new Date(r.scheduled_at) >= startOfToday() && !["realizada", "cancelada"].includes(r.status) },
    { label: "Pasadas", filter: r => new Date(r.scheduled_at) < startOfToday() || ["realizada", "cancelada"].includes(r.status) },
    { label: "Todas", filter: () => true },
  ],
};

export const NOTES = {
  table: "notes",
  title: "Notas",
  singular: "nota",
  fem: true,
  order: { column: "created_at", ascending: false },
  fields: [
    { key: "title", label: "Título", required: true, wide: true },
    { key: "body", label: "Nota", type: "textarea", rows: 6 },
    { key: "pinned", label: "Fijar arriba", type: "checkbox" },
  ],
  columns: [
    { label: "Título", render: r => <strong>{r.pinned ? "📌 " : ""}{r.title}</strong> },
    { label: "Nota", render: r => <Trunc text={r.body} max={380} /> },
    { label: "Fecha", render: r => fmtDateTime(r.created_at) },
  ],
  sort: (a, b) => Number(b.pinned) - Number(a.pinned),
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
