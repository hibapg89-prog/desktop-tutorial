import { useState } from "react";
import { Share2, X, FileText, Check } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

function generatePalettePDF(palette) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;

  // Header band
  doc.setFillColor(4, 57, 39);
  doc.rect(0, 0, W, 80, "F");
  doc.setTextColor(253, 245, 230);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("LUXEBEAUTY · THE MUSE", M, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(palette.name || "Untitled Palette", M, 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text((palette.category || "mixed").toUpperCase(), W - M, 56, {
    align: "right",
  });

  let y = 110;

  // Notes
  if (palette.notes) {
    doc.setTextColor(90, 122, 106);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const notesLines = doc.splitTextToSize(palette.notes, W - M * 2);
    doc.text(notesLines, M, y);
    y += notesLines.length * 14 + 24;
  }

  // Shades header
  doc.setTextColor(4, 57, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SHADES", M, y);
  y += 16;

  (palette.shades || []).forEach((shade) => {
    if (y > H - 60) {
      doc.addPage();
      y = 60;
    }
    const hex = shade.hex || "#000000";
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    doc.setFillColor(r, g, b);
    doc.rect(M, y, 28, 28, "F");
    doc.setTextColor(45, 45, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(shade.name || "Untitled", M + 38, y + 12);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      `${(shade.category || "").toUpperCase()}  ·  ${hex.toUpperCase()}`,
      M + 38,
      y + 24
    );
    y += 38;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let pg = 1; pg <= pages; pg++) {
    doc.setPage(pg);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `LuxeBeauty · Palette Export · Page ${pg} of ${pages}`,
      W / 2,
      H - 22,
      { align: "center" }
    );
  }

  return doc;
}

async function generateShareCard(palette) {
  const W = 1080,
    H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#FDF5E6";
  ctx.fillRect(0, 0, W, H);

  // Top band
  ctx.fillStyle = "#043927";
  ctx.fillRect(0, 0, W, 160);
  ctx.fillStyle = "#C8B06A";
  ctx.font = "300 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("LUXEBEAUTY · THE MUSE", W / 2, 70);
  ctx.fillStyle = "#FDF5E6";
  ctx.font = "300 52px Georgia, serif";
  ctx.fillText(palette.name || "My Palette", W / 2, 125);

  // Notes
  let y = 240;
  if (palette.notes) {
    ctx.fillStyle = "#5A7A6A";
    ctx.font = "italic 26px Georgia, serif";
    ctx.textAlign = "center";
    const words = palette.notes.split(" ");
    let line = "";
    const lines = [];
    words.forEach((w) => {
      const test = line + w + " ";
      if (ctx.measureText(test).width > W - 160) {
        lines.push(line);
        line = w + " ";
      } else line = test;
    });
    lines.push(line);
    lines.forEach((l) => {
      ctx.fillText(l.trim(), W / 2, y);
      y += 36;
    });
    y += 40;
  }

  // Shade swatches
  const shades = palette.shades || [];
  const swatchW = 140,
    swatchH = 180,
    gap = 20;
  const totalW = shades.length * swatchW + (shades.length - 1) * gap;
  const startX = (W - totalW) / 2;
  shades.forEach((shade, i) => {
    const x = startX + i * (swatchW + gap);
    ctx.fillStyle = shade.hex || "#000";
    ctx.fillRect(x, y, swatchW, swatchH);
    ctx.fillStyle = "#043927";
    ctx.font = "400 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText((shade.name || "").slice(0, 16), x + swatchW / 2, y + swatchH + 34);
    ctx.fillStyle = "#5A7A6A";
    ctx.font = "400 18px Georgia, serif";
    ctx.fillText((shade.hex || "").toUpperCase(), x + swatchW / 2, y + swatchH + 62);
  });

  // Footer
  ctx.fillStyle = "#C8B06A";
  ctx.font = "300 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("Crafted in The Muse Studio", W / 2, H - 60);

  return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export default function PaletteExportShare({ palette, onClose }) {
  const [busy, setBusy] = useState(null);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);

  const stamp = () => new Date().toISOString().slice(0, 10);
  const fileName = `LuxeBeauty_Palette_${(palette.name || "untitled").replace(/\s+/g, "_")}_${stamp()}.pdf`;

  const downloadPDF = () => {
    setBusy("pdf");
    setError(null);
    try {
      const doc = generatePalettePDF(palette);
      doc.save(fileName);
      setDone("pdf");
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };

  const shareImage = async () => {
    setBusy("share");
    setError(null);
    try {
      const blob = await generateShareCard(palette);
      const file = new File([blob], `palette_${stamp()}.png`, {
        type: "image/png",
      });
      const shareText = `${palette.name} — my shade palette from LuxeBeauty`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: palette.name,
          text: shareText,
        });
        setDone("share");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `palette_${stamp()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setDone("share-download");
      }
    } catch (e) {
      setError(e.message);
    }
    setBusy(null);
  };

  const OptionRow = ({ icon, label, sublabel, onClick, busyKey, doneKey, accent }) => (
    <button
      onClick={onClick}
      disabled={busy !== null}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] disabled:opacity-50"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? "var(--color-accent-gold)" : "#043927" }}
      >
        {done === doneKey ? (
          <Check size={16} color={accent ? "#fff" : "#FDF5E6"} />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light">{label}</p>
        <p className="text-[0.5625rem] text-primary-40 font-light">{sublabel}</p>
      </div>
      {busy === busyKey && (
        <div className="w-4 h-4 border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
      )}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
            Export & Share
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
          </button>
        </div>

        <p className="text-[0.625rem] text-primary-45 font-light mb-5">
          {palette.name} · {(palette.shades || []).length} shades
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-[0.625rem] text-red-600 font-light">{error}</p>
          </div>
        )}

        <div className="space-y-2.5">
          <OptionRow
            icon={<FileText size={16} color="#FDF5E6" />}
            label="Download PDF"
            sublabel="Styled summary of your palette"
            onClick={downloadPDF}
            busyKey="pdf"
            doneKey="pdf"
          />
          <OptionRow
            icon={<Share2 size={16} color="#fff" />}
            label="Share Image"
            sublabel="Branded card for social media"
            onClick={shareImage}
            busyKey="share"
            doneKey="share"
            accent
          />
        </div>

        <p className="text-center text-[0.5625rem] text-[var(--color-text-muted)] font-light tracking-wide italic mt-5">
          Share your palette with someone who would love it
        </p>
      </motion.div>
    </motion.div>
  );
}