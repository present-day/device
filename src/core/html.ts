import {
  type Cutout,
  type DeviceName,
  type DeviceSpec,
  deviceVars,
  resolveDevice,
} from './devices'

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export interface DeviceHTMLOptions {
  /** The screenshot. */
  src: string
  alt: string
  device?: DeviceName | DeviceSpec
  /** Defaults to the device's own cutout. */
  cutout?: Cutout
  maxHeight?: string
  className?: string
  /** The image's pixel size, so the page can reserve its space. */
  width?: number
  height?: number
  /** Defaults to `lazy`. */
  loading?: 'lazy' | 'eager'
}

/**
 * A screenshot in a device frame, as an HTML string, for pages rendered
 * without React such as Markdown output. Needs `styles.css`.
 */
export function deviceHTML(options: DeviceHTMLOptions): string {
  const spec = resolveDevice(options.device)
  const cutout = options.cutout ?? spec.cutout
  const style = Object.entries(
    deviceVars(spec, { cutout, maxHeight: options.maxHeight }),
  )
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  const size =
    options.width && options.height
      ? ` width="${options.width}" height="${options.height}"`
      : ''
  const buttons = spec.buttons
    .map(
      (b) =>
        `<span class="pd-device-button" data-side="${b.side}" style="--pd-device-button-start:${b.start * 100}%;--pd-device-button-length:${b.length * 100}%"></span>`,
    )
    .join('')
  const className = options.className
    ? `pd-device ${esc(options.className)}`
    : 'pd-device'

  return `<span class="${className}" style="${esc(style)}"><span class="pd-device-body">${buttons}<span class="pd-device-screen"><img class="pd-device-fill" src="${esc(options.src)}" alt="${esc(options.alt)}"${size} loading="${options.loading ?? 'lazy'}" decoding="async">${cutout === 'island' ? '<span class="pd-device-island"></span>' : ''}</span></span></span>`
}
