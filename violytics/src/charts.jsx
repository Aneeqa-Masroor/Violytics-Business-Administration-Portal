import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { useApp } from "./store";
import { COLORS, fmt$ } from "./lib";

/* ---------- theme tokens ---------- */
function useT() {
  const { theme } = useApp(),
    d = theme === "dark";
  return {
    d,
    ax: d ? "#a1a1aa" : "#6b7280",
    grid: d ? "#27272a" : "#eef0f4",
    cur: d ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.06)",
    tip: {
      background: d ? "rgba(9,9,11,0.95)" : "rgba(255,255,255,0.98)",
      border: `1px solid ${d ? "rgba(63,63,70,0.8)" : "rgba(229,231,235,0.9)"}`,
      borderRadius: 14,
      fontSize: 12,
      color: d ? "#fff" : "#111827",
      boxShadow: d
        ? "0 12px 32px -8px rgba(0,0,0,0.6)"
        : "0 12px 32px -8px rgba(15,23,42,0.15)",
      backdropFilter: "blur(12px)",
      padding: "10px 14px",
    },
    tipLabel: {
      color: d ? "#a1a1aa" : "#6b7280",
      fontWeight: 700,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: 4,
    },
    tipItem: { fontSize: 12, fontWeight: 600, padding: "2px 0" },
  };
}

const k = (v) =>
  v >= 1e6
    ? `$${(v / 1e6).toFixed(1)}M`
    : v >= 1e3
      ? `$${Math.round(v / 1e3)}k`
      : `$${v}`;

const axis = (t) => ({
  stroke: t.ax,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
});

/* ---------- custom tooltip ---------- */
function ChartTip({ active, payload, label, t, money = true }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={t.tip}>
      {label && <div style={t.tipLabel}>{label}</div>}
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{ ...t.tipItem, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 3,
              background: p.color || p.fill,
              display: "inline-block",
            }}
          />
          <span style={{ opacity: 0.7 }}>{p.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 800 }}>
            {p.name === "Orders"
              ? p.value
              : money && p.value != null
                ? fmt$(p.value)
                : (p.value ?? "—")}
          </span>
        </div>
      ))}
    </div>
  );
}

const tip = (t, money = true) => (
  <Tooltip
    cursor={{ fill: t.cur, radius: 6 }}
    content={<ChartTip t={t} money={money} />}
  />
);

/* ---------- gradient defs ---------- */
function Defs({ id, from, to, opacity = [0.35, 0] }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={from} stopOpacity={opacity[0]} />
        <stop offset="100%" stopColor={to} stopOpacity={opacity[1]} />
      </linearGradient>
    </defs>
  );
}

/* ================= RevenueChart ================= */
export function RevenueChart({ h = 280 }) {
  const { series } = useApp(),
    t = useT();
  return (
    <ResponsiveContainer width="100%" height={h}>
      <AreaChart
        data={series}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
      >
        <Defs id="revGrad" from="#8b5cf6" to="#8b5cf6" opacity={[0.28, 0]} />
        <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis(t)} minTickGap={16} />
        <YAxis {...axis(t)} tickFormatter={k} width={54} />
        {tip(t)}
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#8b5cf6"
          strokeWidth={3}
          fill="url(#revGrad)"
          dot={series.length < 20 ? { r: 3, strokeWidth: 2, fill: t.d ? "#09090b" : "#fff" } : false}
          activeDot={{
            r: 6,
            strokeWidth: 3,
            stroke: t.d ? "#09090b" : "#fff",
            fill: "#8b5cf6",
          }}
        />
        <Area
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="#a1a1aa"
          strokeWidth={2}
          strokeDasharray="6 4"
          fill="transparent"
          dot={false}
          activeDot={{ r: 4, fill: "#a1a1aa" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ================= SalesChart ================= */
export function SalesChart({ h = 280 }) {
  const { series, up, anchor } = useApp(),
    t = useT();
  const pick = (d) => {
    const p = d.payload || d,
      key = p.key;
    if (p.daily) return up({ preset: "custom", from: key, to: key });
    const [y, m] = key.split("-").map(Number),
      last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    up({
      preset: "custom",
      from: key + "-01",
      to: last > anchor ? anchor : last,
    });
  };
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={series}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        barCategoryGap="25%"
      >
        <Defs id="salesGrad" from="#8b5cf6" to="#6366f1" opacity={[0.95, 0.6]} />
        <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis(t)} minTickGap={16} />
        <YAxis {...axis(t)} width={34} allowDecimals={false} />
        {tip(t, false)}
        <Bar
          dataKey="sales"
          name="Orders"
          fill="url(#salesGrad)"
          radius={[8, 8, 0, 0]}
          style={{ cursor: "pointer" }}
          onClick={pick}
          activeBar={{ fill: "#7c3aed", stroke: "#a78bfa", strokeWidth: 1 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ================= CategoryPie ================= */
export function CategoryPie({ h = 280 }) {
  const { catData, s, up } = useApp(),
    t = useT();
  const selected = (name) => s.cat === "All" || s.cat === name;
  return (
    <ResponsiveContainer width="100%" height={h}>
      <PieChart>
        <Pie
          data={catData}
          dataKey="revenue"
          nameKey="name"
          innerRadius="58%"
          outerRadius="88%"
          paddingAngle={3}
          cornerRadius={6}
          stroke={t.d ? "#09090b" : "#fff"}
          strokeWidth={2}
          onClick={(d) => up({ cat: s.cat === d.name ? "All" : d.name })}
          animationDuration={700}
        >
          {catData.map((c, i) => (
            <Cell
              key={c.name}
              fill={COLORS[i]}
              fillOpacity={selected(c.name) ? 1 : 0.22}
              style={{
                cursor: "pointer",
                outline: "none",
                transition: "fill-opacity 200ms ease",
                filter: selected(c.name)
                  ? `drop-shadow(0 0 6px ${COLORS[i]}55)`
                  : "none",
              }}
            />
          ))}
        </Pie>
        {tip(t)}
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ================= ComparisonChart ================= */
export function ComparisonChart({ h = 300 }) {
  const { catData, s, up } = useApp(),
    t = useT();
  const tog = (d) => {
    const n = (d.payload || d).name;
    up({ cat: s.cat === n ? "All" : n });
  };
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={catData}
        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        barCategoryGap="22%"
        barGap={6}
      >
        <Defs id="prevGrad" from="#a1a1aa" to="#d4d4d8" opacity={[0.9, 0.5]} />
        <Defs id="curGrad" from="#8b5cf6" to="#d946ef" opacity={[0.95, 0.65]} />
        <CartesianGrid stroke={t.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" {...axis(t)} />
        <YAxis {...axis(t)} tickFormatter={k} width={54} />
        {tip(t)}
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }}
        />
        <Bar
          dataKey="previous"
          name="Previous period"
          fill="url(#prevGrad)"
          radius={[8, 8, 0, 0]}
          style={{ cursor: "pointer" }}
          onClick={tog}
        />
        <Bar
          dataKey="revenue"
          name="Selected period"
          fill="url(#curGrad)"
          radius={[8, 8, 0, 0]}
          style={{ cursor: "pointer" }}
          onClick={tog}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}