import { useMemo } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { useApp } from "./store";
import { Badge, Card, DataTable, FilterBar, Toolbar } from "./ui";
import { RevenueChart, SalesChart, CategoryPie, ComparisonChart } from "./charts";
import { fmt$, fmt2, fmtD } from "./lib";

function Kpi({ label, value, cur, prev, icon: I, accent = "violet" }) {
  const d = prev ? ((cur - prev) / prev) * 100 : null;
  const up = d != null && d >= 0;
  const accents = {
    violet: "from-violet-500 to-fuchsia-500",
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-white/5 dark:bg-zinc-900/60">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accents[accent]} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <span className={`rounded-xl bg-gradient-to-br ${accents[accent]} p-2 text-white shadow-lg shadow-${accent}-500/30`}>
          <I className="h-4 w-4" />
        </span>
      </div>
      <p className="relative mt-3 text-2xl font-black tracking-tight">{value}</p>
      <p className={`relative mt-1.5 flex items-center gap-1 text-xs font-bold ${d == null ? "text-gray-400" : up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
        {d == null ? (
          "No prior data"
        ) : (
          <>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(d).toFixed(1)}% <span className="font-medium text-gray-400">vs prev.</span>
          </>
        )}
      </p>
    </div>
  );
}

const Page = ({ children }) => (
  <div className="relative mx-auto max-w-[1400px] space-y-6 p-1">
    {/* ambient background glow */}
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-400/20 blur-[120px] dark:bg-violet-600/10" />
      <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-600/10" />
    </div>
    {children}
  </div>
);

const Grid = ({ children, cols = "lg:grid-cols-3" }) => (
  <div className={`grid gap-4 ${cols}`}>{children}</div>
);

const SectionCard = ({ title, children, className = "" }) => (
  <div className={`group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-lg dark:border-white/5 dark:bg-zinc-900/60 ${className}`}>
    {title && (
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          {title}
        </h3>
      </div>
    )}
    {children}
  </div>
);

export function Overview() {
  const { kpi: { c, p }, cur } = useApp();
  const recent = useMemo(
    () =>
      [...cur]
        .sort((a, b) => b.orderDate.localeCompare(a.orderDate) || b.orderId.localeCompare(a.orderId))
        .slice(0, 6),
    [cur]
  );
  return (
    <Page>
      <FilterBar />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue" value={fmt$(c.revenue)} cur={c.revenue} prev={p.revenue} icon={DollarSign} accent="violet" />
        <Kpi label="Orders" value={c.orders} cur={c.orders} prev={p.orders} icon={ShoppingBag} accent="blue" />
        <Kpi label="Avg. Order Value" value={fmt$(c.aov)} cur={c.aov} prev={p.aov} icon={TrendingUp} accent="emerald" />
        <Kpi label="Active Customers" value={c.customers} cur={c.customers} prev={p.customers} icon={Users} accent="amber" />
      </div>
      <Grid>
        <SectionCard title="Revenue vs Target" className="lg:col-span-2">
          <RevenueChart />
        </SectionCard>
        <SectionCard title="Sales by Category" >
          <CategoryPie />
        </SectionCard>
      </Grid>
      <Grid>
        <SectionCard title="Orders Over Time">
          <SalesChart h={260} />
        </SectionCard>
        <SectionCard title="Recent Orders" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <tbody className="divide-y divide-gray-100/70 dark:divide-zinc-800">
                {recent.map((o) => (
                  <tr key={o.orderId} className="transition-colors hover:bg-violet-50/50 dark:hover:bg-violet-500/5">
                    <td className="py-2.5 pr-2 font-bold">{o.orderId}</td>
                    <td className="pr-2">{o.customer}</td>
                    <td className="pr-2 text-gray-500">{fmtD(o.orderDate)}</td>
                    <td className="pr-2 font-bold">{fmt2(o.amount)}</td>
                    <td><Badge v={o.status} /></td>
                  </tr>
                ))}
                {!recent.length && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      <Sparkles className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      No orders in this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </Grid>
    </Page>
  );
}

export function Analytics() {
  return (
    <Page>
      <FilterBar />
      <SectionCard title="Revenue Trend vs Target">
        <RevenueChart h={340} />
      </SectionCard>
      <Grid cols="lg:grid-cols-2">
        <SectionCard title="Orders Over Time"><SalesChart h={300} /></SectionCard>
        <SectionCard title="Revenue Distribution"><CategoryPie h={300} /></SectionCard>
      </Grid>
      <SectionCard title="Category Performance: Selected vs Previous Period">
        <ComparisonChart />
      </SectionCard>
    </Page>
  );
}

export function Products() {
  const { s, products } = useApp();
  const rows = useMemo(() => {
    const q = (s.q.products || "").toLowerCase(), st = s.st.products || "All";
    return products
      .map((p) => ({
        ...p,
        stockStatus: p.stock === 0 ? "Out of Stock" : p.stock < 20 ? "Low Stock" : "In Stock",
      }))
      .filter(
        (p) =>
          (s.cat === "All" || p.category === s.cat) &&
          (st === "All" || p.stockStatus === st) &&
          (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      );
  }, [products, s.cat, s.q, s.st]);
  const cols = [
    { key: "id", label: "Product ID" },
    {
      key: "image",
      label: "Image",
      noSort: true,
      render: (v) => (
        <img src={v} alt="" loading="lazy"
          className="h-10 w-10 rounded-xl bg-gray-200 object-cover ring-1 ring-black/5 transition-transform hover:scale-110 dark:bg-zinc-800 dark:ring-white/10" />
      ),
    },
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", render: fmt2 },
    { key: "stock", label: "Stock" },
    { key: "stockStatus", label: "Status", render: (v) => <Badge v={v} /> },
  ];
  return (
    <Page>
      <FilterBar range={false} />
      <DataTable
        id="products"
        title="Products"
        cols={cols}
        rows={rows}
        defSort={[{ key: "id", dir: "asc" }]}
        toolbar={<Toolbar id="products" ph="Search product name or ID…" opts={["In Stock", "Low Stock", "Out of Stock"]} label="Stock" />}
      />
    </Page>
  );
}

export function Customers() {
  const { s, customers, cur } = useApp();
  const rows = useMemo(() => {
    const spend = {};
    cur.forEach((o) => {
      if (o.status !== "Cancelled") spend[o.customerId] = (spend[o.customerId] || 0) + o.amount;
    });
    const act = new Set(cur.map((o) => o.customerId)),
      q = (s.q.customers || "").toLowerCase(),
      st = s.st.customers || "All";
    return customers
      .filter(
        (c) =>
          act.has(c.customerId) &&
          (st === "All" || c.status === st) &&
          (!q || [c.customerId, c.name, c.company].some((v) => v.toLowerCase().includes(q)))
      )
      .map((c) => ({ ...c, periodSpend: Math.round(spend[c.customerId] || 0) }));
  }, [customers, cur, s.q, s.st]);
  const cols = [
    { key: "customerId", label: "Customer ID" },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "registrationDate", label: "Registered", render: fmtD },
    { key: "status", label: "Status", render: (v) => <Badge v={v} /> },
    { key: "periodSpend", label: "Period Spend", render: fmt$ },
    { key: "totalSpending", label: "Total Spending", render: fmt2 },
  ];
  return (
    <Page>
      <FilterBar />
      <DataTable
        id="customers"
        title="Customers active in selected period"
        cols={cols}
        rows={rows}
        defSort={[{ key: "totalSpending", dir: "desc" }]}
        toolbar={<Toolbar id="customers" ph="Search name, company or customer ID…" opts={["Active", "Inactive", "Pending"]} />}
      />
    </Page>
  );
}

export function Orders() {
  const { s, cur } = useApp();
  const rows = useMemo(() => {
    const q = (s.q.orders || "").toLowerCase(), st = s.st.orders || "All";
    return cur.filter(
      (o) =>
        (st === "All" || o.status === st) &&
        (!q || [o.orderId, o.customer, o.customerId].some((v) => v.toLowerCase().includes(q)))
    );
  }, [cur, s.q, s.st]);
  const cols = [
    { key: "orderId", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "customerId", label: "Customer ID" },
    { key: "orderDate", label: "Date", render: fmtD },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: fmt2 },
    { key: "status", label: "Status", render: (v) => <Badge v={v} /> },
  ];
  return (
    <Page>
      <FilterBar />
      <DataTable
        id="orders"
        title="Orders"
        cols={cols}
        rows={rows}
        defSort={[{ key: "orderDate", dir: "desc" }]}
        toolbar={<Toolbar id="orders" ph="Search order ID or customer…" opts={["Delivered", "Shipped", "Processing", "Cancelled"]} />}
      />
    </Page>
  );
}