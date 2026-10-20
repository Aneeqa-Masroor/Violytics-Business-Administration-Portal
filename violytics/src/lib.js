export const CATS = [
  "Laptops",
  "Smartphones",
  "Audio",
  "Wearables",
  "Computer Accessories",
];
export const COLORS = ["#7c3aed", "#a78bfa", "#4c1d95", "#c4b5fd", "#6b7280"];
export const PRESETS = [
  ["7d", "Last 7 Days"],
  ["30d", "Last 30 Days"],
  ["qtr", "This Quarter"],
  ["custom", "Custom Range"],
];
const DAY = 864e5;
export const sum = (a) => a.reduce((t, o) => t + o.amount, 0);
export const fmt$ = (n) =>
  Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
export const fmt2 = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
export const fmtD = (s) =>
  new Date(s + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
export const addDays = (s, n) =>
  new Date(Date.parse(s) + n * DAY).toISOString().slice(0, 10);
export const diffDays = (a, b) =>
  Math.round((Date.parse(b) - Date.parse(a)) / DAY);
export function getRange(preset, from, to, anchor) {
  if (preset === "7d") return [addDays(anchor, -6), anchor];
  if (preset === "30d") return [addDays(anchor, -29), anchor];
  if (preset === "qtr") {
    const d = new Date(anchor),
      m = Math.floor(d.getUTCMonth() / 3) * 3;
    return [
      new Date(Date.UTC(d.getUTCFullYear(), m, 1)).toISOString().slice(0, 10),
      anchor,
    ];
  }
  return [from || addDays(anchor, -29), to || anchor];
}
export function sortRows(rows, sort) {
  if (!sort?.length) return rows;
  return [...rows].sort((a, b) => {
    for (const { key, dir } of sort) {
      const x = a[key],
        y = b[key];
      const c =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      if (c) return dir === "asc" ? c : -c;
    }
    return 0;
  });
}
export function toCSV(rows, cols) {
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    cols.map((c) => q(c.label)).join(","),
    ...rows.map((r) => cols.map((c) => q(r[c.key])).join(",")),
  ].join("\n");
}
export function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
