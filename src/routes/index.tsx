import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import rahamaLogo from "@/assets/rahama-logo.jpg.asset.json";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PROPERTY_TYPES,
  SAMPLE_SALES,
  calculateBalance,
  filterSales,
  generatePropertyReference,
  generateReceiptNumber,
  isSaleRecord,
  type PaymentMethod,
  type PaymentStatus,
  type PropertyType,
  type SaleFilters,
  type SaleRecord,
} from "@/lib/sales";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "azare-property-sales-ledger";

const INITIAL_FILTERS: SaleFilters = {
  query: "",
  propertyType: "",
  paymentStatus: "",
  agent: "",
  location: "",
  startDate: "",
  endDate: "",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Ledger | Rahama Land & Property Development Ltd." },
      {
        name: "description",
        content: "Manage property sales, payments, buyer records, and printable receipts for Rahama Land & Property Development Ltd.",
      },
      { property: "og:title", content: "Sales Ledger | Rahama Land & Property Development Ltd." },
      {
        property: "og:description",
        content: "A clear sales worksheet for Rahama property transactions, payments, and receipts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [sales, setSales] = useState<SaleRecord[]>(SAMPLE_SALES);
  const [storageReady, setStorageReady] = useState(false);
  const [filters, setFilters] = useState<SaleFilters>(INITIAL_FILTERS);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SaleRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [receipt, setReceipt] = useState<SaleRecord | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isSaleRecord)) setSales(parsed);
      }
    } catch {
      // An unreadable local copy falls back to the included sample worksheet.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
    } catch {
      // Keep this session usable if browser storage is unavailable or full.
    }
  }, [sales, storageReady]);

  useEffect(() => {
    if (isMobile) setViewMode("cards");
  }, [isMobile]);

  const visibleSales = useMemo(() => filterSales(sales, filters), [sales, filters]);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.agreedPrice, 0);
  const totalOutstanding = sales.reduce(
    (sum, sale) => sum + calculateBalance(sale.agreedPrice, sale.amountPaid),
    0,
  );
  const visibleTotals = visibleSales.reduce(
    (totals, sale) => ({
      agreed: totals.agreed + sale.agreedPrice,
      paid: totals.paid + sale.amountPaid,
      outstanding: totals.outstanding + calculateBalance(sale.agreedPrice, sale.amountPaid),
    }),
    { agreed: 0, paid: 0, outstanding: 0 },
  );

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = new Date(todayStart);
  const daysFromMonday = (todayStart.getDay() + 6) % 7;
  weekStart.setDate(todayStart.getDate() - daysFromMonday);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const inPeriod = (sale: SaleRecord, start: Date) => {
    const saleDate = new Date(`${sale.saleDate}T00:00:00`);
    return saleDate >= start && saleDate <= todayStart;
  };
  const weeklySales = sales.filter((sale) => inPeriod(sale, weekStart));
  const monthlySales = sales.filter((sale) => inPeriod(sale, monthStart));
  const agentLeaders = Array.from(
    sales.reduce((agents, sale) => {
      const agent = agents.get(sale.agentName) ?? { name: sale.agentName, units: 0, value: 0 };
      agent.units += 1;
      agent.value += sale.agreedPrice;
      agents.set(sale.agentName, agent);
      return agents;
    }, new Map<string, { name: string; units: number; value: number }>()),
  )
    .map(([, agent]) => agent)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const agents = Array.from(new Set(sales.map((sale) => sale.agentName).filter(Boolean))).sort();
  const locations = Array.from(new Set(sales.map((sale) => sale.location).filter(Boolean))).sort();
  const hasActiveFilters = Object.values(filters).some(Boolean);

  function openNewSale() {
    const propertyType: PropertyType = "Residential Land";
    const now = new Date();
    const receiptYear = now.getFullYear();
    setEditingId(null);
    setFormError("");
    setDraft({
      id: "",
      buyerName: "",
      buyerPhone: "",
      buyerWhatsApp: "",
      buyerAddress: "",
      buyerState: "Bauchi / Katagum",
      nextOfKin: "",
      nextOfKinPhone: "",
      agentName: "",
      agentPhone: "",
      agentCode: "",
      agentCommission: "",
      propertyRef: generatePropertyReference(sales, propertyType),
      propertyTitle: "",
      propertyType,
      location: "",
      plotNumber: "",
      dimensions: "",
      propertyNotes: "",
      saleDate: now.toISOString().slice(0, 10),
      agreedPrice: 0,
      amountPaid: 0,
      paymentStatus: "Deposit",
      paymentMethod: "Bank Transfer",
      paymentReference: "",
      receiptNumber: generateReceiptNumber(sales, receiptYear),
    });
    setDialogOpen(true);
  }

  function openEditSale(sale: SaleRecord) {
    setEditingId(sale.id);
    setFormError("");
    setDraft({ ...sale });
    setDialogOpen(true);
  }

  function updateDraft<K extends keyof SaleRecord>(key: K, value: SaleRecord[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateMoney(key: "agreedPrice" | "amountPaid", rawValue: string) {
    const amount = Math.max(0, Number(rawValue) || 0);
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, [key]: amount };
      if (next.agreedPrice > 0 && next.amountPaid >= next.agreedPrice) {
        next.paymentStatus = "Fully Paid";
      } else if (next.paymentStatus === "Fully Paid") {
        next.paymentStatus = next.amountPaid > 0 ? "Installment / Easy Buy" : "Deposit";
      }
      return next;
    });
  }

  function saveSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.buyerName.trim() || !draft.agentPhone.trim() || !draft.propertyType || draft.agreedPrice <= 0) {
      setFormError("Add the buyer name, agent phone, property type, and sale price to continue.");
      return;
    }

    const normalizedStatus: PaymentStatus =
      draft.amountPaid >= draft.agreedPrice
        ? "Fully Paid"
        : draft.paymentStatus === "Fully Paid"
          ? draft.amountPaid > 0
            ? "Installment / Easy Buy"
            : "Deposit"
          : draft.paymentStatus;
    const saved: SaleRecord = {
      ...draft,
      id: editingId ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now())),
      buyerName: draft.buyerName.trim(),
      agentPhone: draft.agentPhone.trim(),
      paymentStatus: normalizedStatus,
    };

    setSales((current) =>
      editingId ? current.map((sale) => (sale.id === editingId ? saved : sale)) : [saved, ...current],
    );
    setDialogOpen(false);
  }

  function exportCsv() {
    const columns: Array<[string, (sale: SaleRecord) => string | number]> = [
      ["Receipt number", (sale) => sale.receiptNumber],
      ["Sale date", (sale) => sale.saleDate],
      ["Buyer name", (sale) => sale.buyerName],
      ["Buyer phone", (sale) => sale.buyerPhone],
      ["Buyer WhatsApp", (sale) => sale.buyerWhatsApp],
      ["Buyer address", (sale) => sale.buyerAddress],
      ["Buyer state / LGA", (sale) => sale.buyerState],
      ["Next of kin", (sale) => sale.nextOfKin],
      ["Next of kin phone", (sale) => sale.nextOfKinPhone],
      ["Agent", (sale) => sale.agentName],
      ["Agent phone", (sale) => sale.agentPhone],
      ["Agent code", (sale) => sale.agentCode],
      ["Agent commission", (sale) => sale.agentCommission],
      ["Property reference", (sale) => sale.propertyRef],
      ["Property title", (sale) => sale.propertyTitle],
      ["Property type", (sale) => sale.propertyType],
      ["Location / zone", (sale) => sale.location],
      ["Plot / unit", (sale) => sale.plotNumber],
      ["Dimensions", (sale) => sale.dimensions],
      ["Property notes", (sale) => sale.propertyNotes],
      ["Agreed price (NGN)", (sale) => sale.agreedPrice],
      ["Amount paid (NGN)", (sale) => sale.amountPaid],
      ["Outstanding balance (NGN)", (sale) => calculateBalance(sale.agreedPrice, sale.amountPaid)],
      ["Payment status", (sale) => sale.paymentStatus],
      ["Payment method", (sale) => sale.paymentMethod],
      ["Payment reference", (sale) => sale.paymentReference],
    ];
    const escapeCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [
      columns.map(([label]) => escapeCell(label)).join(","),
      ...visibleSales.map((sale) => columns.map(([, value]) => escapeCell(value(sale))).join(",")),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rahama-property-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function printReceipt(sale: SaleRecord) {
    setReceipt(sale);
    window.setTimeout(() => window.print(), 150);
  }

  function changeFilter(key: keyof SaleFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-background px-5 py-6 md:flex">
          <div className="flex items-center gap-3">
            <img
              src={rahamaLogo.url}
              alt="Rahama Land & Property Development Ltd."
              className="h-12 w-14 shrink-0 rounded-md border bg-background object-contain p-1"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-snug">Rahama Land &amp; Property Development Ltd.</p>
              <p className="mt-1 text-xs text-muted-foreground">Azare · Bauchi</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-md bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground">
              <List className="size-4" aria-hidden="true" />
              Sales register
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">{sales.length}</span>
            </div>
          </div>

          <div className="mt-auto border-t pt-5">
            <div className="flex items-center gap-3 px-1">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                FD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Finance desk</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-paid" /> Saved on this device
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="border-b bg-background">
            <div className="mx-auto grid min-h-16 max-w-[1560px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={rahamaLogo.url}
                  alt=""
                  className="size-9 shrink-0 rounded-md border bg-background object-contain p-0.5 md:hidden"
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground md:hidden">Rahama · Azare</p>
                  <p className="truncate text-sm font-semibold">Sales register</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                  <span className="size-1.5 rounded-full bg-paid" /> Local worksheet
                </span>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={visibleSales.length === 0}>
                  <Download aria-hidden="true" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button size="sm" onClick={openNewSale}>
                  <Plus aria-hidden="true" />
                  <span className="hidden sm:inline">Record sale</span>
                  <span className="sm:hidden">Add sale</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1560px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Rahama Land &amp; Property Development Ltd.</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">Sales ledger</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Review completed sales, payment plans, and property balances across Azare.
                </p>
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                {new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "long", year: "numeric" }).format(today)}
              </p>
            </section>

            <section aria-label="Sales overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total sales revenue"
                value={formatNaira(totalRevenue)}
                caption="Agreed value across all records"
                icon={CircleDollarSign}
                tone="primary"
              />
              <MetricCard
                label="Properties sold"
                value={String(sales.length)}
                caption="Plots, homes, and units recorded"
                icon={Building2}
                tone="paid"
              />
              <MetricCard
                label="Outstanding balance"
                value={formatNaira(totalOutstanding)}
                caption="Payments still due"
                icon={Wallet}
                tone="deposit"
              />
              <MetricCard
                label="Collected to date"
                value={formatNaira(sales.reduce((sum, sale) => sum + sale.amountPaid, 0))}
                caption="Payments received so far"
                icon={Banknote}
                tone="installment"
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                <PeriodCard
                  label="This month"
                  amount={monthlySales.reduce((sum, sale) => sum + sale.agreedPrice, 0)}
                  count={monthlySales.length}
                  icon={ArrowUpRight}
                  period="month"
                />
                <PeriodCard
                  label="This week"
                  amount={weeklySales.reduce((sum, sale) => sum + sale.agreedPrice, 0)}
                  count={weeklySales.length}
                  icon={ArrowDownRight}
                  period="week"
                />
              </div>

              <div className="rounded-md border bg-card px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">Top selling agents</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Ranked by agreed sale value</p>
                  </div>
                  <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="mt-4 divide-y">
                  {agentLeaders.length ? (
                    agentLeaders.map((agent, index) => (
                      <div key={agent.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{agent.name || "Unassigned agent"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {agent.units} {agent.units === 1 ? "property" : "properties"}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold tabular-nums">{formatNaira(agent.value)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-muted-foreground">Agent totals will appear here.</p>
                  )}
                </div>
              </div>
            </section>

            <section id="transactions" className="scroll-mt-5 space-y-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-semibold">Transactions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {visibleSales.length} of {sales.length} records
                    {hasActiveFilters ? " match your filters" : " in the register"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border bg-background p-1" role="group" aria-label="Record layout">
                    <Button
                      variant={viewMode === "table" ? "secondary" : "ghost"}
                      size="icon"
                      className="size-8"
                      aria-label="Table view"
                      title="Table view"
                      aria-pressed={viewMode === "table"}
                      onClick={() => setViewMode("table")}
                    >
                      <List aria-hidden="true" />
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "secondary" : "ghost"}
                      size="icon"
                      className="size-8"
                      aria-label="Card view"
                      title="Card view"
                      aria-pressed={viewMode === "cards"}
                      onClick={() => setViewMode("cards")}
                    >
                      <LayoutGrid aria-hidden="true" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportCsv} disabled={visibleSales.length === 0}>
                    <FileSpreadsheet aria-hidden="true" />
                    Export visible
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(4,minmax(130px,1fr))]">
                  <div className="relative sm:col-span-2 xl:col-span-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      aria-label="Search sales records"
                      placeholder="Buyer, agent, property ref, plot…"
                      className="h-10 bg-background pl-9"
                      value={filters.query}
                      onChange={(event) => changeFilter("query", event.currentTarget.value)}
                    />
                  </div>
                  <FilterSelect
                    ariaLabel="Filter by property type"
                    placeholder="All property types"
                    value={filters.propertyType || "all"}
                    options={PROPERTY_TYPES.map((option) => [option, option])}
                    onChange={(value) => changeFilter("propertyType", value === "all" ? "" : value)}
                  />
                  <FilterSelect
                    ariaLabel="Filter by payment status"
                    placeholder="All payment statuses"
                    value={filters.paymentStatus || "all"}
                    options={PAYMENT_STATUSES.map((option) => [option, option])}
                    onChange={(value) => changeFilter("paymentStatus", value === "all" ? "" : value)}
                  />
                  <FilterSelect
                    ariaLabel="Filter by agent"
                    placeholder="All agents"
                    value={filters.agent || "all"}
                    options={agents.map((agent) => [agent, agent])}
                    onChange={(value) => changeFilter("agent", value === "all" ? "" : value)}
                  />
                  <FilterSelect
                    ariaLabel="Filter by location"
                    placeholder="All locations"
                    value={filters.location || "all"}
                    options={locations.map((location) => [location, location])}
                    onChange={(value) => changeFilter("location", value === "all" ? "" : value)}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <SlidersHorizontal className="size-3.5" aria-hidden="true" /> Sale date
                    </span>
                    <Input
                      type="date"
                      aria-label="Filter starting sale date"
                      className="h-9 w-full bg-background sm:w-40"
                      value={filters.startDate}
                      onChange={(event) => changeFilter("startDate", event.currentTarget.value)}
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="date"
                      aria-label="Filter ending sale date"
                      className="h-9 w-full bg-background sm:w-40"
                      value={filters.endDate}
                      onChange={(event) => changeFilter("endDate", event.currentTarget.value)}
                    />
                  </div>
                  <Button
                    variant={hasActiveFilters ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(INITIAL_FILTERS)}
                    aria-pressed={!hasActiveFilters}
                    title="Show every sale in the register"
                    className="self-start sm:self-auto"
                  >
                    <List aria-hidden="true" /> All records
                    <span className="ml-1 tabular-nums">{sales.length}</span>
                  </Button>
                </div>
              </div>

              {viewMode === "table" ? (
                <div className="overflow-hidden rounded-md border bg-card">
                  <div className="max-h-[620px] overflow-auto">
                    <table className="w-full min-w-[1350px] border-separate border-spacing-0 text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-secondary/90 text-xs text-secondary-foreground backdrop-blur">
                        <tr>
                          <th className="border-b px-4 py-3 font-semibold">Buyer</th>
                          <th className="border-b px-4 py-3 font-semibold">Property</th>
                          <th className="border-b px-4 py-3 font-semibold">Location / unit</th>
                          <th className="border-b px-4 py-3 font-semibold">Agent</th>
                          <th className="border-b px-4 py-3 font-semibold">Sale date</th>
                          <th className="border-b px-4 py-3 text-right font-semibold">Agreed price</th>
                          <th className="border-b px-4 py-3 text-right font-semibold">Paid</th>
                          <th className="border-b px-4 py-3 text-right font-semibold">Balance</th>
                          <th className="border-b px-4 py-3 font-semibold">Status</th>
                          <th className="border-b px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleSales.map((sale) => (
                          <tr key={sale.id} className="group bg-card transition-colors hover:bg-muted/50">
                            <td className="border-b px-4 py-3.5">
                              <p className="whitespace-nowrap font-medium">{sale.buyerName}</p>
                              <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                                <Phone className="size-3" aria-hidden="true" /> {sale.buyerPhone || "No phone added"}
                              </p>
                            </td>
                            <td className="border-b px-4 py-3.5">
                              <p className="whitespace-nowrap font-medium">{sale.propertyRef}</p>
                              <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{sale.propertyType}</p>
                            </td>
                            <td className="border-b px-4 py-3.5">
                              <p className="flex items-center gap-1.5 whitespace-nowrap font-medium">
                                <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" /> {sale.location}
                              </p>
                              <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{sale.plotNumber || "—"}</p>
                            </td>
                            <td className="border-b px-4 py-3.5">
                              <p className="whitespace-nowrap font-medium">{sale.agentName || "—"}</p>
                              <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
                                {sale.agentCode || sale.agentPhone}
                              </p>
                            </td>
                            <td className="border-b px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                              {formatDate(sale.saleDate)}
                            </td>
                            <td className="border-b px-4 py-3.5 text-right font-medium tabular-nums whitespace-nowrap">
                              {formatNaira(sale.agreedPrice)}
                            </td>
                            <td className="border-b px-4 py-3.5 text-right tabular-nums whitespace-nowrap">
                              {formatNaira(sale.amountPaid)}
                            </td>
                            <td className="border-b px-4 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap">
                              {formatNaira(calculateBalance(sale.agreedPrice, sale.amountPaid))}
                            </td>
                            <td className="border-b px-4 py-3.5 whitespace-nowrap">
                              <StatusPill status={sale.paymentStatus} />
                            </td>
                            <td className="border-b px-4 py-3.5">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Print receipt for ${sale.buyerName}`}
                                  title="Print receipt"
                                  onClick={() => printReceipt(sale)}
                                >
                                  <Printer aria-hidden="true" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Edit sale for ${sale.buyerName}`}
                                  title="Edit sale"
                                  onClick={() => openEditSale(sale)}
                                >
                                  <Pencil aria-hidden="true" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {visibleSales.length === 0 && <EmptyRecords hasFilters={hasActiveFilters} onAdd={openNewSale} />}
                  </div>
                  <VisibleTotals count={visibleSales.length} totals={visibleTotals} />
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleSales.length ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {visibleSales.map((sale) => (
                        <article key={sale.id} className="rounded-md border bg-card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{sale.buyerName}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{sale.receiptNumber}</p>
                            </div>
                            <StatusPill status={sale.paymentStatus} />
                          </div>
                          <div className="mt-4 border-t pt-3">
                            <p className="text-xs font-semibold text-primary">{sale.propertyRef}</p>
                            <p className="mt-1 text-sm font-medium">{sale.propertyTitle || sale.propertyType}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="size-3.5" aria-hidden="true" /> {sale.location} · {sale.plotNumber || "No unit number"}
                            </p>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-3">
                            <MobileDetail label="Agreed price" value={formatNaira(sale.agreedPrice)} />
                            <MobileDetail label="Paid to date" value={formatNaira(sale.amountPaid)} />
                            <MobileDetail
                              label="Outstanding"
                              value={formatNaira(calculateBalance(sale.agreedPrice, sale.amountPaid))}
                            />
                            <MobileDetail label="Sale date" value={formatDate(sale.saleDate)} />
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">{sale.agentName || "Agent not assigned"}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{sale.agentPhone}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Print receipt for ${sale.buyerName}`}
                                onClick={() => printReceipt(sale)}
                              >
                                <Printer aria-hidden="true" /> Print
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label={`Edit sale for ${sale.buyerName}`}
                                onClick={() => openEditSale(sale)}
                              >
                                <Pencil aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-md border bg-card">
                      <EmptyRecords hasFilters={hasActiveFilters} onAdd={openNewSale} />
                    </div>
                  )}
                  <div className="overflow-hidden rounded-md border bg-card">
                    <VisibleTotals count={visibleSales.length} totals={visibleTotals} />
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <SaleDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
        editing={editingId !== null}
        error={formError}
        onChange={updateDraft}
        onMoneyChange={updateMoney}
        onPaymentStatusChange={(status) => {
          setDraft((current) => current ? {
            ...current,
            paymentStatus: status,
            amountPaid: status === "Fully Paid" ? current.agreedPrice : current.amountPaid,
          } : current);
        }}
        onSubmit={saveSale}
        onPropertyTypeChange={(propertyType) => {
          setDraft((current) =>
            current
              ? {
                  ...current,
                  propertyType,
                  propertyRef: generatePropertyReference(sales, propertyType),
                }
              : current,
          );
        }}
      />

      <article className="print-area" aria-label="Printable sale receipt">
        {receipt && <Receipt sale={receipt} />}
      </article>
    </div>
  );
}

function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  icon: typeof CircleDollarSign;
  tone: "primary" | "paid" | "deposit" | "installment";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    paid: "bg-paid/10 text-paid",
    deposit: "bg-deposit/15 text-deposit",
    installment: "bg-installment/10 text-installment",
  };

  return (
    <div className="rounded-md border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

function PeriodCard({
  label,
  amount,
  count,
  icon: Icon,
  period,
}: {
  label: string;
  amount: number;
  count: number;
  icon: typeof ArrowUpRight;
  period: "month" | "week";
}) {
  return (
    <div className="rounded-md border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-md ${period === "month" ? "bg-paid/10 text-paid" : "bg-accent text-accent-foreground"}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tabular-nums">{formatNaira(amount)}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {count} {count === 1 ? "property" : "properties"} recorded {period === "month" ? "this month" : "this week"}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: PaymentStatus }) {
  const statusClass =
    status === "Fully Paid"
      ? "bg-paid/10 text-paid"
      : status === "Deposit"
        ? "bg-deposit/15 text-deposit"
        : "bg-installment/10 text-installment";

  return <span className={`inline-flex max-w-full items-center rounded-sm px-2 py-1 text-xs font-medium ${statusClass}`}>{status}</span>;
}

function FilterSelect({
  ariaLabel,
  placeholder,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  placeholder: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{ariaLabel}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={ariaLabel} className="h-10 bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map(([optionValue, label]) => (
            <SelectItem key={optionValue} value={optionValue}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function VisibleTotals({
  count,
  totals,
}: {
  count: number;
  totals: { agreed: number; paid: number; outstanding: number };
}) {
  return (
    <div className="grid gap-3 bg-secondary/50 px-4 py-3 sm:grid-cols-4 sm:items-center">
      <p className="text-xs font-semibold text-muted-foreground">Visible totals · {count} {count === 1 ? "record" : "records"}</p>
      <p className="text-xs text-muted-foreground">
        Agreed <span className="ml-1 font-semibold tabular-nums text-foreground">{formatNaira(totals.agreed)}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Collected <span className="ml-1 font-semibold tabular-nums text-foreground">{formatNaira(totals.paid)}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Balance <span className="ml-1 font-semibold tabular-nums text-foreground">{formatNaira(totals.outstanding)}</span>
      </p>
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function EmptyRecords({ hasFilters, onAdd }: { hasFilters: boolean; onAdd: () => void }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        {hasFilters ? <Search className="size-5" aria-hidden="true" /> : <FileText className="size-5" aria-hidden="true" />}
      </span>
      <h3 className="mt-4 text-sm font-semibold">{hasFilters ? "No matching sales" : "No sales recorded"}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters ? "Try a different search or clear your filters." : "Add the first property transaction to the register."}
      </p>
      {!hasFilters && (
        <Button className="mt-4" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" /> Record a sale
        </Button>
      )}
    </div>
  );
}

function SaleDialog({
  open,
  onOpenChange,
  draft,
  editing,
  error,
  onChange,
  onMoneyChange,
  onPaymentStatusChange,
  onSubmit,
  onPropertyTypeChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: SaleRecord | null;
  editing: boolean;
  error: string;
  onChange: <K extends keyof SaleRecord>(key: K, value: SaleRecord[K]) => void;
  onMoneyChange: (key: "agreedPrice" | "amountPaid", value: string) => void;
  onPaymentStatusChange: (value: PaymentStatus) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPropertyTypeChange: (value: PropertyType) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] w-[calc(100%-1rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b px-5 py-5 pr-14 text-left sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Transaction worksheet</p>
          <DialogTitle className="mt-1 text-xl">{editing ? "Edit sale record" : "Record a new sale"}</DialogTitle>
          <DialogDescription>
            Capture buyer, agent, property, and payment details. The balance updates as you enter payments.
          </DialogDescription>
        </DialogHeader>

        {draft && (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7">
              {error && (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <FormSection number="01" title="Buyer details" description="The purchaser and contact information.">
                <FormField id="buyerName" label="Buyer full name">
                  <Input id="buyerName" required autoComplete="name" value={draft.buyerName} onChange={(event) => onChange("buyerName", event.currentTarget.value)} />
                </FormField>
                <FormField id="buyerPhone" label="Buyer phone">
                  <Input id="buyerPhone" type="tel" autoComplete="tel" value={draft.buyerPhone} onChange={(event) => onChange("buyerPhone", event.currentTarget.value)} />
                </FormField>
                <FormField id="buyerWhatsApp" label="WhatsApp" optional>
                  <Input id="buyerWhatsApp" type="tel" value={draft.buyerWhatsApp} onChange={(event) => onChange("buyerWhatsApp", event.currentTarget.value)} />
                </FormField>
                <FormField id="buyerAddress" label="Buyer address">
                  <Input id="buyerAddress" autoComplete="street-address" value={draft.buyerAddress} onChange={(event) => onChange("buyerAddress", event.currentTarget.value)} />
                </FormField>
                <FormField id="buyerState" label="State / LGA">
                  <Input id="buyerState" value={draft.buyerState} onChange={(event) => onChange("buyerState", event.currentTarget.value)} />
                </FormField>
                <FormField id="nextOfKin" label="Next of kin" optional>
                  <Input id="nextOfKin" value={draft.nextOfKin} onChange={(event) => onChange("nextOfKin", event.currentTarget.value)} />
                </FormField>
                <FormField id="nextOfKinPhone" label="Alternate phone" optional>
                  <Input id="nextOfKinPhone" type="tel" value={draft.nextOfKinPhone} onChange={(event) => onChange("nextOfKinPhone", event.currentTarget.value)} />
                </FormField>
              </FormSection>

              <FormSection number="02" title="Agent details" description="The person responsible for this sale.">
                <FormField id="agentName" label="Agent full name" optional>
                  <Input id="agentName" value={draft.agentName} onChange={(event) => onChange("agentName", event.currentTarget.value)} />
                </FormField>
                <FormField id="agentPhone" label="Agent phone">
                  <Input id="agentPhone" required type="tel" value={draft.agentPhone} onChange={(event) => onChange("agentPhone", event.currentTarget.value)} />
                </FormField>
                <FormField id="agentCode" label="Agent code / ID" optional>
                  <Input id="agentCode" placeholder="AGT-001" value={draft.agentCode} onChange={(event) => onChange("agentCode", event.currentTarget.value)} />
                </FormField>
                <FormField id="agentCommission" label="Commission / fee" optional>
                  <Input id="agentCommission" placeholder="₦180,000 or 5%" value={draft.agentCommission} onChange={(event) => onChange("agentCommission", event.currentTarget.value)} />
                </FormField>
              </FormSection>

              <FormSection number="03" title="Property specifications" description="Reference, category, location, and plot details.">
                <FormField id="propertyRef" label="Property reference">
                  <Input id="propertyRef" readOnly value={draft.propertyRef} className="bg-muted font-mono text-sm" />
                </FormField>
                <FormField id="propertyTitle" label="Property title / description">
                  <Input id="propertyTitle" value={draft.propertyTitle} onChange={(event) => onChange("propertyTitle", event.currentTarget.value)} />
                </FormField>
                <FormField id="propertyType" label="Property category">
                  <Select value={draft.propertyType} onValueChange={(value) => onPropertyTypeChange(value as PropertyType)}>
                    <SelectTrigger id="propertyType" aria-label="Property category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((propertyType) => <SelectItem key={propertyType} value={propertyType}>{propertyType}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField id="location" label="Address / location / zone">
                  <Input id="location" placeholder="Azare Central, Fatara…" value={draft.location} onChange={(event) => onChange("location", event.currentTarget.value)} />
                </FormField>
                <FormField id="plotNumber" label="Plot / house / unit number">
                  <Input id="plotNumber" placeholder="Plot 14, Block B" value={draft.plotNumber} onChange={(event) => onChange("plotNumber", event.currentTarget.value)} />
                </FormField>
                <FormField id="dimensions" label="Plot dimensions / size" optional>
                  <Input id="dimensions" placeholder="50 ft × 100 ft / 464.5 m²" value={draft.dimensions} onChange={(event) => onChange("dimensions", event.currentTarget.value)} />
                </FormField>
                <FormField id="propertyNotes" label="Property information / notes" optional className="sm:col-span-2">
                  <Textarea id="propertyNotes" rows={3} value={draft.propertyNotes} onChange={(event) => onChange("propertyNotes", event.currentTarget.value)} />
                </FormField>
              </FormSection>

              <FormSection number="04" title="Financials & transaction" description="Sale price, payments, and receipt references.">
                <FormField id="saleDate" label="Sale date">
                  <Input id="saleDate" required type="date" value={draft.saleDate} onChange={(event) => onChange("saleDate", event.currentTarget.value)} />
                </FormField>
                <FormField id="receiptNumber" label="Sale slip / receipt number">
                  <Input id="receiptNumber" readOnly value={draft.receiptNumber} className="bg-muted font-mono text-sm" />
                </FormField>
                <FormField id="agreedPrice" label="Agreed price (₦)">
                  <Input id="agreedPrice" required min="1" step="1" type="number" inputMode="numeric" value={draft.agreedPrice || ""} onChange={(event) => onMoneyChange("agreedPrice", event.currentTarget.value)} />
                </FormField>
                <FormField id="amountPaid" label="Amount paid to date (₦)">
                  <Input id="amountPaid" min="0" step="1" type="number" inputMode="numeric" value={draft.amountPaid || ""} onChange={(event) => onMoneyChange("amountPaid", event.currentTarget.value)} />
                </FormField>
                <FormField id="balance" label="Outstanding balance (₦)">
                  <Input id="balance" readOnly value={formatNaira(calculateBalance(draft.agreedPrice, draft.amountPaid))} className="bg-secondary font-semibold tabular-nums" />
                </FormField>
                <FormField id="paymentStatus" label="Payment status">
                  <Select
                    value={draft.paymentStatus}
                    onValueChange={(value) => onPaymentStatusChange(value as PaymentStatus)}
                  >
                    <SelectTrigger id="paymentStatus"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField id="paymentMethod" label="Payment method">
                  <Select value={draft.paymentMethod} onValueChange={(value) => onChange("paymentMethod", value as PaymentMethod)}>
                    <SelectTrigger id="paymentMethod"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField id="paymentReference" label="Payment reference / teller" optional className="sm:col-span-2">
                  <Input id="paymentReference" value={draft.paymentReference} onChange={(event) => onChange("paymentReference", event.currentTarget.value)} />
                </FormField>
              </FormSection>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-5 py-4 sm:flex-row sm:justify-between sm:px-7">
              <p className="self-center text-xs text-muted-foreground">Fields marked required must be completed.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit"><Check aria-hidden="true" /> {editing ? "Save changes" : "Save sale"}</Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b pb-7 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-secondary text-xs font-semibold text-secondary-foreground">{number}</span>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FormField({
  id,
  label,
  optional = false,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium">
        <span>{label}</span>
        {optional && <span className="font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
    </div>
  );
}

function Receipt({ sale }: { sale: SaleRecord }) {
  const balance = calculateBalance(sale.agreedPrice, sale.amountPaid);
  return (
    <div className="receipt-sheet">
      <header className="receipt-header">
        <img src={rahamaLogo.url} alt="Rahama Land & Property Development Ltd." className="receipt-logo" />
        <div>
          <p className="receipt-eyebrow">Property sales · Azare, Bauchi</p>
          <h1>Rahama Land &amp; Property Development Ltd.</h1>
          <p className="receipt-company-number">RC No. 9871926</p>
        </div>
        <div className="receipt-kind">OFFICIAL SALE SLIP</div>
      </header>

      <div className="receipt-title-row">
        <div>
          <p className="receipt-eyebrow">Transaction receipt</p>
          <h2>Sale confirmation</h2>
        </div>
        <div className="receipt-number">
          <span>Receipt number</span>
          <strong>{sale.receiptNumber}</strong>
        </div>
      </div>

      <div className="receipt-grid">
        <ReceiptSection title="Buyer details">
          <ReceiptLine label="Buyer" value={sale.buyerName} />
          <ReceiptLine label="Phone / WhatsApp" value={[sale.buyerPhone, sale.buyerWhatsApp].filter(Boolean).join(" · ") || "—"} />
          <ReceiptLine label="Address" value={[sale.buyerAddress, sale.buyerState].filter(Boolean).join(" · ") || "—"} />
          <ReceiptLine label="Next of kin" value={[sale.nextOfKin, sale.nextOfKinPhone].filter(Boolean).join(" · ") || "—"} />
        </ReceiptSection>
        <ReceiptSection title="Property details">
          <ReceiptLine label="Reference" value={sale.propertyRef} />
          <ReceiptLine label="Description" value={sale.propertyTitle || sale.propertyType} />
          <ReceiptLine label="Category" value={sale.propertyType} />
          <ReceiptLine label="Location / zone" value={sale.location || "—"} />
          <ReceiptLine label="Plot / unit" value={sale.plotNumber || "—"} />
          <ReceiptLine label="Dimensions" value={sale.dimensions || "—"} />
          <ReceiptLine label="Notes" value={sale.propertyNotes || "—"} />
        </ReceiptSection>
      </div>

      <div className="receipt-transaction">
        <div className="receipt-transaction-heading">
          <h2>Payment summary</h2>
          <span>Sale date · {formatDate(sale.saleDate)}</span>
        </div>
        <div className="receipt-amount-row"><span>Total agreed price</span><strong>{formatNaira(sale.agreedPrice)}</strong></div>
        <div className="receipt-amount-row"><span>Amount paid to date</span><strong>{formatNaira(sale.amountPaid)}</strong></div>
        <div className="receipt-amount-row receipt-balance"><span>Outstanding balance</span><strong>{formatNaira(balance)}</strong></div>
        <div className="receipt-payment-meta">
          <span>Payment status: <strong>{sale.paymentStatus}</strong></span>
          <span>Method: <strong>{sale.paymentMethod}</strong></span>
          <span>Reference: <strong>{sale.paymentReference || "—"}</strong></span>
        </div>
      </div>

      <div className="receipt-agent">
        <span>Sales agent</span><strong>{sale.agentName || "—"}</strong>
        <span>Agent phone</span><strong>{sale.agentPhone || "—"}</strong>
        <span>Agent code</span><strong>{sale.agentCode || "—"}</strong>
      </div>

      <p className="receipt-disclaimer">
        This sale slip records the transaction details and payments received to date. Keep it for your records.
      </p>
      <div className="receipt-signatures">
        <div><span>Buyer signature</span><i /></div>
        <div><span>Agent signature</span><i /></div>
        <div><span>Company director</span><i /></div>
      </div>
      <footer className="receipt-footer">
        <span>RAHAMA LAND &amp; PROPERTY DEVELOPMENT LTD. · RC NO. 9871926</span>
        <span>{sale.receiptNumber}</span>
      </footer>
    </div>
  );
}

function ReceiptSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="receipt-section">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
  return <p className="receipt-line"><span>{label}</span><strong>{value}</strong></p>;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(date);
}