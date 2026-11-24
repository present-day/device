/** Stand-in app screens drawn here, so the stories ship no one's real screenshots. */
const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="system-ui,sans-serif">${body}</svg>`,
  )}`

const rows = (count: number, top: number, width: number) =>
  Array.from(
    { length: count },
    (_, i) =>
      `<rect x="20" y="${top + i * 92}" width="${width - 40}" height="76" rx="14" fill="#1f2a24"/><circle cx="52" cy="${top + i * 92 + 38}" r="16" fill="#34c76f"/><rect x="80" y="${top + i * 92 + 24}" width="${width * 0.45}" height="10" rx="5" fill="#cfe9d9"/><rect x="80" y="${top + i * 92 + 44}" width="${width * 0.3}" height="8" rx="4" fill="#6b8577"/>`,
  ).join('')

/** A 390 × 844 phone screen with a status bar, title and list. */
export const PHONE_SCREEN = svg(
  390,
  844,
  `<rect width="390" height="844" fill="#0f1512"/><text x="32" y="34" fill="#fff" font-size="16" font-weight="600">9:41</text><text x="20" y="110" fill="#fff" font-size="34" font-weight="800">Nearby</text>${rows(7, 136, 390)}`,
)

/** A 1180 × 820 tablet screen with one big number. */
export const TABLET_SCREEN = svg(
  1180,
  820,
  `<rect width="1180" height="820" fill="#0b0b0c"/><text x="590" y="120" fill="#9aa" font-size="28" text-anchor="middle" letter-spacing="4">FRIDAY 9-BALL</text><text x="590" y="560" fill="#ff453a" font-size="420" font-weight="800" text-anchor="middle">3</text>`,
)

/** A small page for the iframe story, laid out at 390 CSS pixels. */
export const PHONE_PAGE = `data:text/html;charset=utf-8,${encodeURIComponent(
  `<!doctype html><meta name="viewport" content="width=device-width"><body style="margin:0;font:16px system-ui;background:#0f1512;color:#fff"><header style="padding:20px;font-size:28px;font-weight:800">An embedded page</header>${Array.from({ length: 20 }, (_, i) => `<p style="margin:0 20px 12px;padding:16px;border-radius:12px;background:#1f2a24">Row ${i + 1}, laid out at 390px</p>`).join('')}</body>`,
)}`
