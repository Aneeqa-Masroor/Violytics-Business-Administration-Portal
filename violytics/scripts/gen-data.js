import fs from "fs";
let a = 20261019;
const rnd = () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (l, h) => l + Math.floor(rnd() * (h - l + 1)),
  pick = (x) => x[Math.floor(rnd() * x.length)];
const END = Date.UTC(2026, 9, 19),
  DAY = 864e5,
  iso = (t) => new Date(t).toISOString().slice(0, 10),
  r2 = (n) => Math.round(n * 100) / 100;
const CAT = {
  Laptops: [
    [
      "Aero 14 Ultrabook",
      "Forge 16 Pro",
      "Slate Air 13",
      "Titan G15 Gaming",
      "Nimbus 15 Flex",
      "Vertex Studio 17",
    ],
    650,
    2200,
  ],
  Smartphones: [
    [
      "Nova X1",
      "Nova X1 Pro",
      "Pulse 5G",
      "Orbit Lite",
      "Zenith Fold",
      "Echo SE",
    ],
    300,
    1400,
  ],
  Audio: [
    [
      "Halo ANC Headphones",
      "Pods Mini",
      "Bass Cube Speaker",
      "Studio Monitor 5",
      "Wave Soundbar",
      "Clip Earbuds",
    ],
    40,
    400,
  ],
  Wearables: [
    [
      "Pulse Watch 3",
      "Fit Band 7",
      "Ring Sense",
      "Trek GPS Watch",
      "Kids Tracker",
      "Lite Band",
    ],
    60,
    450,
  ],
  "Computer Accessories": [
    [
      "Mech Keyboard K8",
      "Ergo Mouse M2",
      "USB-C Hub 9-in-1",
      "4K Webcam",
      "Laptop Stand Pro",
      "Portable SSD 1TB",
    ],
    15,
    250,
  ],
};
let n = 0;
const products = Object.entries(CAT).flatMap(([category, [names, lo, hi]]) =>
  names.map((name) => {
    n++;
    return {
      id: `PRD-${String(n).padStart(3, "0")}`,
      name,
      price: r2(Math.round(int(lo, hi) / 10) * 10 - 0.01),
      category,
      stock: rnd() < 0.1 ? 0 : rnd() < 0.25 ? int(1, 19) : int(20, 240),
      image: `https://picsum.photos/seed/violytics-${n}/80/80`,
    };
  }),
);
const F = [
  "Ayesha",
  "Omar",
  "Sara",
  "Hamza",
  "Zainab",
  "Bilal",
  "Maria",
  "Usman",
  "Hina",
  "Danish",
  "Laiba",
  "Farhan",
  "Noor",
  "Imran",
  "Sana",
];
const L = [
  "Khan",
  "Ahmed",
  "Raza",
  "Sheikh",
  "Malik",
  "Qureshi",
  "Siddiqui",
  "Ansari",
  "Baig",
  "Hussain",
  "Farooqui",
  "Mirza",
];
const CO = [
  "Nexa Retail",
  "BrightWave",
  "Orbit Traders",
  "Pixel Hub",
  "Metro Gadgets",
  "Zenith Corp",
  "Techno Mart",
  "CloudNine",
  "Bluefin Supply",
  "Apex Digital",
  "Urban Circuit",
  "Sparkline Co",
];
const base = Array.from({ length: 60 }, (_, i) => ({
  customerId: `CUS-${1001 + i}`,
  name: `${F[i % 15]} ${L[(i * 7 + 3) % 12]}`,
  company: pick(CO),
  registrationDate: iso(END - int(380, 1400) * DAY),
  status: rnd() < 0.65 ? "Active" : rnd() < 0.57 ? "Inactive" : "Pending",
}));
const W = [
  "Laptops",
  "Laptops",
  "Smartphones",
  "Smartphones",
  "Smartphones",
  "Audio",
  "Audio",
  "Wearables",
  "Computer Accessories",
  "Computer Accessories",
];
const orders = Array.from({ length: 800 }, () => {
  const off = Math.floor(365 * Math.pow(rnd(), 1.35)),
    category = pick(W),
    p = pick(products.filter((x) => x.category === category));
  const qty = ["Laptops", "Smartphones"].includes(category)
    ? rnd() < 0.85
      ? 1
      : 2
    : int(1, 3);
  const status =
    rnd() < 0.07
      ? "Cancelled"
      : off > 14
        ? "Delivered"
        : off > 5
          ? pick(["Shipped", "Delivered"])
          : pick(["Processing", "Shipped"]);
  return {
    customerId: pick(base).customerId,
    orderDate: iso(END - off * DAY),
    category,
    amount: r2(p.price * qty),
    status,
  };
})
  .sort((x, y) => x.orderDate.localeCompare(y.orderDate))
  .map((o, i) => ({ orderId: `ORD-${10001 + i}`, ...o }));
const spend = {},
  m = {};
orders
  .filter((o) => o.status !== "Cancelled")
  .forEach((o) => {
    spend[o.customerId] = (spend[o.customerId] || 0) + o.amount;
    const k = o.orderDate.slice(0, 7);
    m[k] ??= { month: k, revenue: 0, sales: 0 };
    m[k].revenue += o.amount;
    m[k].sales++;
  });
const customers = base.map((c) => ({
  ...c,
  totalSpending: r2(spend[c.customerId] || 0),
}));
const revenue = Object.values(m)
  .sort((x, y) => x.month.localeCompare(y.month))
  .map((r) => ({
    month: r.month,
    revenue: Math.round(r.revenue),
    sales: r.sales,
    target: Math.round((r.revenue * (0.92 + rnd() * 0.2)) / 1000) * 1000,
  }));
fs.mkdirSync("src/data", { recursive: true });
Object.entries({ revenue, products, customers, orders }).forEach(([k, v]) =>
  fs.writeFileSync(`src/data/${k}.json`, JSON.stringify(v, null, 1)),
);
console.log("Generated", orders.length, "orders");
