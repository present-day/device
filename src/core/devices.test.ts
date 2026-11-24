import { describe, expect, it } from 'vitest'

import { DEVICES, deviceGeometry, deviceVars } from './devices'

describe('deviceGeometry', () => {
  it.each(Object.keys(DEVICES) as (keyof typeof DEVICES)[])(
    'gives the %s screen the viewport shape',
    (name) => {
      const { viewport } = DEVICES[name]
      const g = deviceGeometry(name, 300)
      expect(g.screen.width / g.screen.height).toBeCloseTo(
        viewport.width / viewport.height,
        6,
      )
      expect(g.width).toBe(300)
      expect(g.height).toBeCloseTo(g.screen.height + g.bezel * 2, 6)
      expect(g.scale * viewport.width).toBeCloseTo(g.screen.width, 6)
    },
  )

  it('rounds the body around the screen with the bezel', () => {
    const g = deviceGeometry('phone', 400)
    expect(g.radius).toBeCloseTo(g.screen.radius + g.bezel, 6)
  })

  it('draws the island only when the cutout is island', () => {
    expect(deviceGeometry('phone', 300).island).toBeDefined()
    expect(deviceGeometry('phone', 300, 'none').island).toBeUndefined()
    expect(deviceGeometry('tablet', 300).island).toBeUndefined()
  })
})

describe('deviceVars', () => {
  it('sets the screen aspect from the viewport', () => {
    expect(deviceVars('phone')['--pd-device-aspect']).toBe('390 / 844')
  })

  it('narrows the device so a max height fits the whole frame', () => {
    const vars = deviceVars('phone', { maxHeight: '80vh' })
    const g = deviceGeometry('phone', 100)
    const ratio = Number(
      vars['--pd-device-max-width']?.match(/\* ([\d.]+)\)/)?.[1],
    )
    expect(ratio).toBeCloseTo(g.width / g.height, 3)
  })

  it('leaves out the island when there is none', () => {
    expect(deviceVars('phone', { cutout: 'none' })).not.toHaveProperty(
      '--pd-device-island-width',
    )
  })
})
