export type Cutout = 'island' | 'none'

export interface DeviceButton {
  side: 'left' | 'right' | 'top'
  /** Where the button starts, as a fraction of that side's length. */
  start: number
  /** Button length, as a fraction of that side's length. */
  length: number
}

export interface DeviceSpec {
  /**
   * The CSS-pixel viewport the screen shows. A screenshot or page laid out at
   * this size fills the screen exactly; the frame takes its shape from it.
   */
  viewport: { width: number; height: number }
  /** Bezel thickness, as a fraction of the device's outer width. */
  bezel: number
  /** Screen corner radius, as a fraction of the screen width. */
  screenRadius: number
  cutout: Cutout
  buttons: readonly DeviceButton[]
}

/**
 * Proportions follow the screen, not a particular model: the phone is a
 * 390 × 844 iPhone-class screen (iPhone 12 to 14), the size most app
 * screenshots and phone demos are laid out at; the tablet is an 1180 × 820
 * iPad Air in landscape.
 */
export const DEVICES = {
  phone: {
    viewport: { width: 390, height: 844 },
    bezel: 0.036,
    // Apple's 47.33 pt display corner radius on a 390 pt screen.
    screenRadius: 47.33 / 390,
    cutout: 'island',
    buttons: [
      { side: 'left', start: 0.175, length: 0.045 },
      { side: 'left', start: 0.255, length: 0.085 },
      { side: 'left', start: 0.36, length: 0.085 },
      { side: 'right', start: 0.29, length: 0.14 },
    ],
  },
  tablet: {
    viewport: { width: 1180, height: 820 },
    bezel: 0.032,
    // 18 pt display corners on a 1180 pt screen.
    screenRadius: 18 / 1180,
    cutout: 'none',
    buttons: [{ side: 'top', start: 0.84, length: 0.06 }],
  },
} as const satisfies Record<string, DeviceSpec>

export type DeviceName = keyof typeof DEVICES

/** The Dynamic Island, as fractions of the screen width (126 × 37 pt, 11 pt down, on a 393 pt screen). */
const ISLAND = { width: 126 / 393, height: 37 / 393, top: 11 / 393 }

/** How far the side buttons stand out from the body, as a fraction of the device width. */
const BUTTON_DEPTH = 0.008

export function resolveDevice(device: DeviceName | DeviceSpec = 'phone') {
  return typeof device === 'string' ? DEVICES[device] : device
}

export interface DeviceGeometry {
  width: number
  height: number
  bezel: number
  radius: number
  screen: { width: number; height: number; radius: number }
  /** Absent when the cutout is `none`. */
  island?: { width: number; height: number; top: number }
  buttonDepth: number
  /** Multiply the viewport by this to fit it to the screen. */
  scale: number
}

/**
 * Every measurement of a device drawn `width` units wide, in the same units.
 * For renderers that can't use the stylesheet, such as React Native.
 */
export function deviceGeometry(
  device: DeviceName | DeviceSpec,
  width: number,
  cutout?: Cutout,
): DeviceGeometry {
  const spec = resolveDevice(device)
  const bezel = spec.bezel * width
  const screenWidth = width - bezel * 2
  const screenHeight =
    (screenWidth * spec.viewport.height) / spec.viewport.width
  const screenRadius = spec.screenRadius * screenWidth
  return {
    width,
    height: screenHeight + bezel * 2,
    bezel,
    radius: screenRadius + bezel,
    screen: { width: screenWidth, height: screenHeight, radius: screenRadius },
    island:
      (cutout ?? spec.cutout) === 'island'
        ? {
            width: ISLAND.width * screenWidth,
            height: ISLAND.height * screenWidth,
            top: ISLAND.top * screenWidth,
          }
        : undefined,
    buttonDepth: BUTTON_DEPTH * width,
    scale: screenWidth / spec.viewport.width,
  }
}

const round = (n: number) => Math.round(n * 1e4) / 1e4

/**
 * The custom properties `styles.css` draws a device from. Lengths are in
 * percent of the device's width and become `cqi` in the stylesheet.
 * `maxHeight` is any CSS length; the width shrinks to keep the shape.
 */
export function deviceVars(
  device: DeviceName | DeviceSpec = 'phone',
  options: { cutout?: Cutout; maxHeight?: string } = {},
): Record<`--pd-device-${string}`, string> {
  const spec = resolveDevice(device)
  const g = deviceGeometry(spec, 100, options.cutout)
  const vars: Record<`--pd-device-${string}`, string> = {
    '--pd-device-aspect': `${spec.viewport.width} / ${spec.viewport.height}`,
    '--pd-device-bezel': `${round(g.bezel)}`,
    '--pd-device-radius': `${round(g.radius)}`,
    '--pd-device-screen-radius': `${round(g.screen.radius)}`,
    '--pd-device-button-depth': `${round(g.buttonDepth)}`,
  }
  if (g.island) {
    vars['--pd-device-island-width'] = `${round(g.island.width)}`
    vars['--pd-device-island-height'] = `${round(g.island.height)}`
    vars['--pd-device-island-top'] = `${round(g.island.top)}`
  }
  if (options.maxHeight)
    vars['--pd-device-max-width'] =
      `calc(${options.maxHeight} * ${round(g.width / g.height)})`
  return vars
}
