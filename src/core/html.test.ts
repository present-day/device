import { describe, expect, it } from 'vitest'

import { deviceHTML } from './html'

describe('deviceHTML', () => {
  it('frames a screenshot with the phone defaults', () => {
    const html = deviceHTML({
      src: '/shot.webp',
      alt: 'The map',
      width: 390,
      height: 844,
    })
    expect(html).toContain('class="pd-device"')
    expect(html).toContain('--pd-device-aspect:390 / 844')
    expect(html).toContain(
      '<img class="pd-device-fill" src="/shot.webp" alt="The map" width="390" height="844" loading="lazy"',
    )
    expect(html).toContain('pd-device-island')
    expect(html.match(/class="pd-device-button"/g)).toHaveLength(4)
  })

  it('escapes what it is given', () => {
    const html = deviceHTML({ src: '/a.webp?x=1&y="2"', alt: '<b>"hi"</b>' })
    expect(html).toContain('src="/a.webp?x=1&amp;y=&quot;2&quot;"')
    expect(html).toContain('alt="&lt;b&gt;&quot;hi&quot;&lt;/b&gt;"')
  })

  it('uses only phrasing elements, so it can sit inside a button', () => {
    const html = deviceHTML({ src: '/a.webp', alt: '' })
    expect(html).not.toMatch(/<(div|figure|p)\b/)
  })

  it('drops the island for cutout none and on the tablet', () => {
    expect(
      deviceHTML({ src: '/a.webp', alt: '', cutout: 'none' }),
    ).not.toContain('pd-device-island')
    expect(
      deviceHTML({ src: '/a.webp', alt: '', device: 'tablet' }),
    ).not.toContain('pd-device-island')
  })
})
