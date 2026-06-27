import QRCode from "qrcode";

/**
 * Thermal / A4 sticker printing for show entries.
 *
 * Each sticker carries the show name + event date header, a scannable QR code,
 * a large bold bench code ("Class + Tank No.", e.g. "A1 - 001"), and an
 * "A Finoy Masterpiece" footer. Printing opens a clean popup window so the
 * thermal printer only receives the labels — not the whole app UI.
 */

export type LabelFormat = "thermal" | "a4" | "zebra" | "label40x60";

export interface StickerData {
  code: string; // "A1 - 001"
  qrValue: string; // URL encoded into the QR
}

export interface StickerHeader {
  showName: string;
  date: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stickerHtml(
  it: StickerData,
  qrSvg: string,
  header: StickerHeader,
): string {
  return `
  <div class="sticker">
    <div class="hdr">
      <span class="show">${escapeHtml(header.showName)}</span>
      <span class="date">${escapeHtml(header.date)}</span>
    </div>
    <div class="mid">
      <div class="qr">${qrSvg}</div>
      <div class="codewrap">
        <div class="code">${escapeHtml(it.code)}</div>
      </div>
    </div>
    <div class="powered">A <b>Finoy</b> Masterpiece</div>
  </div>`;
}

function pageCss(format: LabelFormat): string {
  if (format === "a4") {
    return `
      @page { size: A4; margin: 10mm; }
      body { display: flex; flex-wrap: wrap; gap: 4mm; align-content: flex-start; }
      .sticker { border: 0.3mm dashed #888; }
    `;
  }
  if (format === "zebra") {
    return `
      @page { size: 57mm 32mm; margin: 0; }
      .sticker { page-break-after: always; }
    `;
  }
  if (format === "label40x60") {
    // Portrait 40×60 — stack the QR over the bench code for the taller label.
    return `
      @page { size: 40mm 60mm; margin: 0; }
      .sticker { width: 40mm; height: 60mm; page-break-after: always; }
      .sticker .mid { flex-direction: column; justify-content: center; gap: 3mm; }
      .sticker .qr { width: 28mm; height: 28mm; }
      .sticker .code { font-size: 9mm; }
    `;
  }
  return `
    @page { size: 50mm 30mm; margin: 0; }
    .sticker { page-break-after: always; }
  `;
}

function baseCss(): string {
  return `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000;
      font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sticker {
      width: 50mm; height: 30mm; padding: 1.4mm 2mm;
      display: flex; flex-direction: column; justify-content: space-between;
      background: #fff; color: #000; overflow: hidden;
    }
    .hdr { display: flex; justify-content: space-between; align-items: baseline; gap: 2mm;
      border-bottom: 0.3mm solid #000; padding-bottom: 0.5mm; }
    .hdr .show { font-size: 2.5mm; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hdr .date { font-size: 2.2mm; font-weight: 600; white-space: nowrap; flex: 0 0 auto; }
    .mid { display: flex; align-items: center; gap: 2mm; flex: 1; min-height: 0; }
    .qr { width: 15mm; height: 15mm; flex: 0 0 auto; }
    .qr svg { width: 100%; height: 100%; display: block; }
    .codewrap { flex: 1; min-width: 0; text-align: center; }
    .code { font-weight: 900; font-size: 9mm; line-height: 1; letter-spacing: 0.3px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { font-size: 2mm; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mono { font-family: "Courier New", monospace; }
    .powered { text-align: center; font-size: 2mm; letter-spacing: 0.2px;
      border-top: 0.3mm solid #000; padding-top: 0.5mm; }
    .powered b { font-weight: 800; }
  `;
}

// Build the full, self-contained print document (labels + page CSS) for a batch.
async function buildStickerDocument(
  items: StickerData[],
  format: LabelFormat,
  header: StickerHeader,
): Promise<string> {
  const svgs = await Promise.all(
    items.map((it) =>
      QRCode.toString(it.qrValue, {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
      }),
    ),
  );

  const body = items.map((it, i) => stickerHtml(it, svgs[i], header)).join("");
  const css = baseCss() + pageCss(format);
  return `<!doctype html><html><head><meta charset="utf-8"><title>FINOY — Labels</title><style>${css}</style></head><body>${body}</body></html>`;
}

export async function printStickers(
  items: StickerData[],
  format: LabelFormat,
  header: StickerHeader,
): Promise<void> {
  if (items.length === 0) return;

  const html = await buildStickerDocument(items, format, header);

  const win = window.open("", "_blank", "width=520,height=680");
  if (!win) {
    alert("Please allow pop-ups to print labels.");
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  // Let the SVGs lay out, then trigger the print dialog.
  win.setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}

/**
 * Compress a selected batch of labels into ONE self-contained file the organizer
 * can save and feed to any printer later (e.g. a shared print station). The file
 * holds every selected sticker plus the print CSS, so opening it prints the whole
 * batch in one go — no app, no network needed.
 */
export async function downloadStickerBatch(
  items: StickerData[],
  format: LabelFormat,
  header: StickerHeader,
  filename = "finoy-labels.html",
): Promise<void> {
  if (items.length === 0) return;

  const html = await buildStickerDocument(items, format, header);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
