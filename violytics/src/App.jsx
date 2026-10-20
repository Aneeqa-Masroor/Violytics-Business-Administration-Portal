import { useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  Users,
  X,
  Sparkles,
} from "lucide-react";
import { useApp } from "./store";
import { Analytics, Customers, Orders, Overview, Products } from "./pages";

const nav = [
  ["/", "Overview", LayoutDashboard],
  ["/analytics", "Analytics", BarChart3],
  ["/products", "Products", Package],
  ["/customers", "Customers", Users],
  ["/orders", "Orders", ShoppingCart],
];

export default function App() {
  const { theme, setTheme } = useApp(),
    [open, setOpen] = useState(false),
    { pathname } = useLocation();
  const title = nav.find((n) => n[0] === pathname)?.[1] || "Overview";

  return (
    <div className="relative min-h-screen bg-[#f8f9fa] font-sans text-gray-900 transition-colors dark:bg-zinc-950 dark:text-gray-100">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-600/10" />
        <div className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-600/10" />
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 m-0 flex w-64 flex-col border-r border-gray-200/60 bg-white/80 p-5 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-zinc-800/60 dark:bg-zinc-950/80 lg:m-4 lg:h-[calc(100vh-2rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-2xl lg:shadow-gray-200/20 dark:lg:shadow-black/40 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg font-black text-white shadow-lg shadow-violet-500/30">
              V
            </div>
            <div>
              <p className="text-lg font-black tracking-tight leading-none">Violytics</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <Sparkles className="h-3 w-3" /> BI Dashboard
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-zinc-800"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5">
          {nav.map(([to, l, I]) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                    : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <I
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-violet-500 dark:text-zinc-500 dark:group-hover:text-violet-400"
                    }`}
                  />
                  {l}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl bg-gray-50/80 p-3 text-center dark:bg-zinc-900/50">
          <p className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
            Electronics BI Dashboard
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-screen flex-col lg:pl-[19rem]">
        
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-4 py-4 backdrop-blur-xl dark:bg-zinc-950/80 sm:px-6 lg:px-8 lg:mt-4 lg:rounded-2xl lg:border lg:border-white/60 lg:shadow-sm dark:lg:border-white/5">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-black tracking-tight">{title}</h1>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-violet-300 hover:text-violet-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-violet-500/50 dark:hover:text-violet-300"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12" />
            )}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}