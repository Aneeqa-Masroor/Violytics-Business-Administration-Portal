import { useMemo } from "react";
import {
  Download,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "./store";
import { CATS, PRESETS, fmtD, sortRows, toCSV, download } from "./lib";

/* ---------- shared control styles ---------- */
export const inp =
  "h-9 rounded-xl border border-gray-200/80 bg-white/80 px-3 text-[13px] font-semibold text-gray-800 shadow-sm outline-none backdrop-blur transition-colors placeholder:text-gray-400 placeholder:font-normal focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-gray-100 dark:placeholder:text-zinc-500";

const btn =
  "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all active:scale-[0.97] disabled:pointer-events-none";

const btnGhost =
  `${btn} border border-gray-200/80 bg-white/70 text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10 dark:hover:text-violet-300`;

const btnPrimary =
  `${btn} bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40`;

/* ---------- badge palette ---------- */
const tones = {
  p: "bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 ring-1 ring-inset ring-violet-200/60 dark:from-violet-500/20 dark:to-fuchsia-500/10 dark:text-violet-200 dark:ring-violet-500/20",
  g: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/60",
  r: "bg-gradient-to-br from-rose-100 to-red-100 text-rose-700 ring-1 ring-inset ring-rose-200/60 dark:from-rose-500/20 dark:to-red-500/10 dark:text-rose-200 dark:ring-rose-500/20",
};
const toneOf = {
  Delivered: "p",
  Active: "p",
  "In Stock": "p",
  Shipped: "p",
  Processing: "g",
  Pending: "g",
  "Low Stock": "g",
  Cancelled: "r",
  Inactive: "r",
  "Out of Stock": "r",
};

export const Badge = ({ v }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[toneOf[v] || "g"]}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {v}
  </span>
);

/* ---------- card ---------- */
export const Card = ({ title, right, children, className = "" }) => (
  <section
    className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-lg dark:border-white/5 dark:bg-zinc-950/70 ${className}`}
  >
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-2xl dark:from-violet-600/10 dark:to-fuchsia-600/10" />
    {(title || right) && (
      <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-black tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          {title}
        </h2>
        {right}
      </div>
    )}
    <div className="relative">{children}</div>
  </section>
);


/* ---------- filter bar ---------- */
export function FilterBar({ range = true }) {
  const { s, up, reset, start, end, anchor } = useApp();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/60 bg-white/60 p-2 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/50">
      {range && (
        <>
          <div className="relative">
            {/* Added z-10 to sit above the select background, and explicit text-gray classes */}
            <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-zinc-400" stroke="currentColor" />
            <select
              aria-label="Date range"
              className={`${inp} appearance-none pl-9 pr-8 cursor-pointer`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1em 1em",
              }}
              value={s.preset}
              onChange={(e) => up({ preset: e.target.value })}
            >
              {PRESETS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          {s.preset === "custom" && (
            <>
              <input
                type="date"
                className={inp}
                value={start}
                max={end}
                onChange={(e) => e.target.value && up({ from: e.target.value, to: end })}
              />
              <span className="text-xs font-medium text-gray-400">→</span>
              <input
                type="date"
                className={inp}
                value={end}
                min={start}
                max={anchor}
                onChange={(e) => e.target.value && up({ from: start, to: e.target.value })}
              />
            </>
          )}
          {s.preset !== "custom" && (
            <span className="hidden items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 sm:inline-flex dark:bg-violet-500/10 dark:text-violet-300">
              <Calendar className="h-3 w-3 text-violet-500" stroke="currentColor" />
              {fmtD(start)} – {fmtD(end)}
            </span>
          )}
        </>
      )}
      <div className="relative">
        {/* Added z-10 to sit above the select background */}
        <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 dark:text-zinc-400" stroke="currentColor" />
        <select
          aria-label="Category"
          className={`${inp} appearance-none pl-9 pr-8 cursor-pointer`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1em 1em",
          }}
          value={s.cat}
          onChange={(e) => up({ cat: e.target.value })}
        >
          {["All", ...CATS].map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>
      <button onClick={reset} className={`${btnGhost} ml-auto`}>
        <RotateCcw className="h-3.5 w-3.5" stroke="currentColor" />
        Reset
      </button>
    </div>
  );
}

/* ---------- toolbar ---------- */
export function Toolbar({ id, ph, opts, label = "Status" }) {
  const { s, setKey } = useApp();
  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-zinc-400" stroke="currentColor" />
        <input
          className={`${inp} w-full pl-9`}
          placeholder={ph}
          value={s.q[id] || ""}
          onChange={(e) => setKey("q", id, e.target.value)}
        />
      </div>
      <select
        aria-label={label}
        className={`${inp} appearance-none pl-3 pr-8 cursor-pointer`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1em 1em",
        }}
        value={s.st[id] || "All"}
        onChange={(e) => setKey("st", id, e.target.value)}
      >
        {["All", ...opts].map((o) => (
          <option key={o} value={o}>
            {o === "All" ? `All ${label}` : o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- data table ---------- */
const SIZE = 8;

export function DataTable({ id, title, cols, rows, defSort = [], toolbar }) {
  const { s, setKey } = useApp();
  const sort = s.sort[id] ?? defSort;
  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / SIZE)),
    pg = Math.min(s.pg[id] || 0, pages - 1);
  const view = sorted.slice(pg * SIZE, pg * SIZE + SIZE),
    n = sorted.length;

  const click = (key, e) => {
    const i = sort.findIndex((x) => x.key === key),
      flip = (x) => (x.dir === "asc" ? "desc" : "asc");
    setKey(
      "sort",
      id,
      e.shiftKey
        ? i < 0
          ? [...sort, { key, dir: "asc" }]
          : sort.map((x) => (x.key === key ? { ...x, dir: flip(x) } : x))
        : [{ key, dir: i === 0 && sort.length === 1 ? flip(sort[0]) : "asc" }]
    );
  };

  return (
    <Card
      title={title}
      right={
        <button
          onClick={() => download(`violytics-${id}.csv`, toCSV(sorted, cols))}
          className={btnPrimary}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      }
    >
      <div className="space-y-3">
        {toolbar}
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
            tip
          </span>
          Click a heading to sort · Shift+click to add a secondary sort
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200/80 shadow-sm dark:border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-gradient-to-b from-gray-50 to-gray-100/50 dark:from-zinc-900 dark:to-zinc-900/50">
              <tr>
                {cols.map((c) => {
                  const i = sort.findIndex((x) => x.key === c.key);
                  return (
                    <th
                      key={c.key}
                      onClick={(e) => !c.noSort && click(c.key, e)}
                      aria-sort={
                        i < 0
                          ? "none"
                          : sort[i].dir === "asc"
                            ? "ascending"
                            : "descending"
                      }
                      className={`whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 ${
                        c.noSort
                          ? ""
                          : "cursor-pointer select-none transition-colors hover:text-violet-600 dark:hover:text-violet-300"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {i >= 0 && (
                          <span className="inline-flex items-center rounded-md bg-violet-100 p-0.5 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                            {sort[i].dir === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                        {i >= 0 && sort.length > 1 && (
                          <sup className="text-violet-500">{i + 1}</sup>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 dark:divide-zinc-800/80">
              {view.map((r, ri) => (
                <tr
                  key={ri}
                  className="transition-colors hover:bg-violet-50/70 dark:hover:bg-violet-500/5"
                >
                  {cols.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-3 py-3">
                      {c.render ? c.render(r[c.key], r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {!n && (
                <tr>
                  <td
                    colSpan={cols.length}
                    className="px-3 py-12 text-center"
                  >
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-gray-400">
                      <span className="rounded-full bg-gray-100 p-3 dark:bg-zinc-800">
                        <Search className="h-5 w-5" />
                      </span>
                      <p className="text-xs font-semibold">No records match your filters</p>
                      <p className="text-[11px] opacity-70">Try clearing the search or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">
            {n ? pg * SIZE + 1 : 0}–{Math.min(n, (pg + 1) * SIZE)} of{" "}
            <span className="font-bold text-gray-700 dark:text-gray-200">{n}</span> records
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pg === 0}
              onClick={() => setKey("pg", id, pg - 1)}
              className={btnGhost}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:text-gray-200 dark:ring-zinc-700">
              {pg + 1} / {pages}
            </span>
            <button
              disabled={pg >= pages - 1}
              onClick={() => setKey("pg", id, pg + 1)}
              className={btnGhost}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}