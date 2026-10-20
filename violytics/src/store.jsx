import { createContext, useContext, useEffect, useMemo, useState } from "react";
import revenueData from "./data/revenue.json";
import products from "./data/products.json";
import customers from "./data/customers.json";
import orders from "./data/orders.json";
import { CATS, COLORS, addDays, diffDays, getRange, sum } from "./lib";

const Ctx = createContext();
export const useApp = () => useContext(Ctx);
const init = {
  preset: "30d",
  from: "",
  to: "",
  cat: "All",
  q: {},
  st: {},
  sort: {},
  pg: {},
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("violytics-theme") || "light",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("violytics-theme", theme);
  }, [theme]);
  const [s, setS] = useState(init);
  const up = (p) => setS((o) => ({ ...o, ...p, pg: {} }));
  const setKey = (g, id, v) =>
    setS((o) => ({
      ...o,
      [g]: { ...o[g], [id]: v },
      ...(g === "pg" ? {} : { pg: { ...o.pg, [id]: 0 } }),
    }));
  const reset = () => setS(init);

  // "today" = latest order in the dataset, so presets always show data
  const anchor = useMemo(
    () => orders.reduce((m, o) => (o.orderDate > m ? o.orderDate : m), "0"),
    [],
  );
  const [start, end] = getRange(s.preset, s.from, s.to, anchor);
  const custMap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.customerId, c])),
    [],
  );
  const all = useMemo(
    () =>
      orders.map((o) => ({
        ...o,
        customer: custMap[o.customerId]?.name || "—",
      })),
    [custMap],
  );
  const curAll = useMemo(
    () => all.filter((o) => o.orderDate >= start && o.orderDate <= end),
    [all, start, end],
  );
  const prevAll = useMemo(() => {
    const n = diffDays(start, end) + 1,
      a = addDays(start, -n),
      b = addDays(start, -1);
    return all.filter((o) => o.orderDate >= a && o.orderDate <= b);
  }, [all, start, end]);
  const byCat = (a) =>
    s.cat === "All" ? a : a.filter((o) => o.category === s.cat);
  const cur = useMemo(() => byCat(curAll), [curAll, s.cat]);
  const prev = useMemo(() => byCat(prevAll), [prevAll, s.cat]);

  const kpi = useMemo(() => {
    const f = (a) => {
      const ok = a.filter((o) => o.status !== "Cancelled"),
        r = sum(ok);
      return {
        revenue: r,
        orders: a.length,
        aov: ok.length ? r / ok.length : 0,
        customers: new Set(a.map((o) => o.customerId)).size,
      };
    };
    return { c: f(cur), p: f(prev) };
  }, [cur, prev]);

  const series = useMemo(() => {
    const daily = diffDays(start, end) <= 31,
      m = {};
    if (daily)
      for (let d = start; d <= end; d = addDays(d, 1))
        m[d] = { key: d, revenue: 0, sales: 0 };
    cur.forEach((o) => {
      if (o.status === "Cancelled") return;
      const k = daily ? o.orderDate : o.orderDate.slice(0, 7);
      m[k] ??= { key: k, revenue: 0, sales: 0 };
      m[k].revenue += o.amount;
      m[k].sales++;
    });
    return Object.values(m)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((r) => {
        const mo = revenueData.find((x) => x.month === r.key.slice(0, 7)),
          t =
            mo && s.cat === "All" ? (daily ? mo.target / 30 : mo.target) : null;
        const label = daily
          ? new Date(r.key + "T00:00:00Z").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })
          : new Date(r.key + "-01T00:00:00Z").toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
              timeZone: "UTC",
            });
        return {
          ...r,
          revenue: Math.round(r.revenue),
          target: t && Math.round(t),
          daily,
          label,
        };
      });
  }, [cur, start, end, s.cat]);

  const catData = useMemo(
    () =>
      CATS.map((c, i) => {
        const a = curAll.filter(
            (o) => o.category === c && o.status !== "Cancelled",
          ),
          b = prevAll.filter(
            (o) => o.category === c && o.status !== "Cancelled",
          );
        return {
          name: c,
          revenue: Math.round(sum(a)),
          previous: Math.round(sum(b)),
          sales: a.length,
          fill: COLORS[i],
        };
      }),
    [curAll, prevAll],
  );

  return (
    <Ctx.Provider
      value={{
        theme,
        setTheme,
        s,
        up,
        setKey,
        reset,
        anchor,
        start,
        end,
        cur,
        curAll,
        kpi,
        series,
        catData,
        products,
        customers,
        all,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
