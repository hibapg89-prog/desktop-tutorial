import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function fmtPrice(p) {
  const v = p.current_price ?? p.price;
  if (!v && v !== 0) return "";
  const cur = p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$";
  return `${cur}${v}`;
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function downloadCSV(products) {
  const headers = [
    "Brand", "Name", "Shade", "Category", "Subcategory",
    "Price", "Currency", "Expiry Date", "On Sale", "Where to Buy",
  ];
  const rows = products.map((p) => [
    p.brand || "",
    p.name || "",
    p.shade || "",
    p.category || "",
    p.subcategory || "",
    p.current_price ?? p.price ?? "",
    p.currency || "USD",
    p.expiry_date || "",
    p.on_sale ? "Yes" : "No",
    p.where_to_buy || "",
  ]);
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `LuxeBeauty_Vanity_${stamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(products) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;

  // Header band
  doc.setFillColor(4, 57, 39);
  doc.rect(0, 0, W, 72, "F");
  doc.setTextColor(253, 245, 230);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("LUXEBEAUTY · THE MUSE", M, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("La Vanity", M, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${products.length} products · ${new Date().toLocaleDateString()}`,
    W - M,
    52,
    { align: "right" }
  );

  const cols = [
    { title: "BRAND", key: "brand", x: M, w: 95, max: 26 },
    { title: "PRODUCT", key: "name", x: M + 100, w: 140, max: 30 },
    { title: "SHADE", key: "shade", x: M + 245, w: 70, max: 16 },
    { title: "CATEGORY", key: "category", x: M + 320, w: 85, max: 20 },
    { title: "PRICE", key: "price", x: M + 410, w: 55, max: 10 },
    { title: "EXPIRY", key: "expiry", x: M + 470, w: 70, max: 12 },
  ];

  let y = 110;
  doc.setFillColor(245, 237, 216);
  doc.rect(M, y - 14, W - M * 2, 20, "F");
  doc.setTextColor(4, 57, 39);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  cols.forEach((c) => doc.text(c.title, c.x, y));
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(45, 45, 45);
  doc.setFontSize(8);

  const rowH = 20;
  products.forEach((p, i) => {
    if (y > H - 60) {
      doc.addPage();
      y = 60;
    }
    if (i % 2 === 0) {
      doc.setFillColor(252, 250, 245);
      doc.rect(M, y - 13, W - M * 2, rowH, "F");
    }
    cols.forEach((c) => {
      let val = "";
      if (c.key === "price") val = fmtPrice(p);
      else if (c.key === "expiry") val = p.expiry_date ? p.expiry_date : "";
      else val = p[c.key] || "";
      doc.text(String(val).slice(0, c.max), c.x, y);
    });
    y += rowH;
  });

  const pages = doc.internal.getNumberOfPages();
  for (let pg = 1; pg <= pages; pg++) {
    doc.setPage(pg);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `LuxeBeauty · Vanity Export · Page ${pg} of ${pages}`,
      W / 2,
      H - 22,
      { align: "center" }
    );
  }

  doc.save(`LuxeBeauty_Vanity_${stamp()}.pdf`);
}

export default function VanityExport({ products }) {
  const [busy, setBusy] = useState(null);
  const run = (kind) => {
    setBusy(kind);
    try {
      if (kind === "pdf") exportPDF(products);
      else downloadCSV(products);
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#043927] text-[#FDF5E6] text-[11px] tracking-[0.12em] font-light px-4 py-2.5 rounded-2xl"
          aria-label="Export vanity"
        >
          <Download size={13} /> Export
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => run("pdf")}
          disabled={busy === "pdf"}
          className="flex items-center gap-2"
        >
          <FileText size={14} /> PDF Document
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run("csv")}
          disabled={busy === "csv"}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet size={14} /> Spreadsheet (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}