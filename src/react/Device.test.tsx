import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { intersectionObservers } from '../test/setup'
import { Device } from './Device'

describe('Device', () => {
  it('draws a screenshot at the screen size with the island', () => {
    const { container } = render(<Device src="/shot.webp" alt="The map" />)
    const img = screen.getByAltText('The map')
    expect(img).toHaveClass('pd-device-fill')
    expect(container.querySelector('.pd-device-island')).not.toBeNull()
    expect(container.firstElementChild).toHaveStyle({
      '--pd-device-aspect': '390 / 844',
    })
  })

  it('lays an iframe out at the viewport, out of the tab order, without the island', () => {
    const { container } = render(
      <Device iframe="https://example.com" title="Demo" />,
    )
    const frame = screen.getByTitle('Demo')
    expect(frame).toHaveStyle({ width: '390px', height: '844px' })
    expect(frame).toHaveAttribute('tabindex', '-1')
    expect(frame).toHaveAttribute('loading', 'lazy')
    expect(container.querySelector('.pd-device-island')).toBeNull()
    expect(container.firstElementChild).toHaveAttribute(
      'data-interactive',
      'false',
    )
  })

  it('keeps an interactive iframe in the tab order', () => {
    render(<Device iframe="https://example.com" title="Demo" interactive />)
    expect(screen.getByTitle('Demo')).not.toHaveAttribute('tabindex')
  })

  it('scales viewport content to the measured screen', () => {
    const width = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(195)
    const { container } = render(
      <Device iframe="https://example.com" title="Demo" />,
    )
    const screenEl = container.querySelector<HTMLElement>('.pd-device-screen')
    expect(screenEl?.style.getPropertyValue('--pd-device-scale')).toBe('0.5')
    expect(screenEl).toHaveAttribute('data-scaled')
    width.mockRestore()
  })

  it('renders children at the screen size by default and at the viewport on request', () => {
    const { rerender, container } = render(
      <Device>
        <p>Hello</p>
      </Device>,
    )
    expect(
      container.querySelector('.pd-device-fill.pd-device-content'),
    ).not.toBeNull()
    rerender(
      <Device fit="viewport">
        <p>Hello</p>
      </Device>,
    )
    expect(container.querySelector('.pd-device-viewport')).toHaveStyle({
      width: '390px',
    })
  })

  it('passes the iframe load through and reports ready', () => {
    const onLoad = vi.fn()
    const onStatusChange = vi.fn()
    render(
      <Device
        iframe="https://example.com"
        title="Demo"
        iframeProps={{ onLoad }}
        onStatusChange={onStatusChange}
      />,
    )
    fireEvent.load(screen.getByTitle('Demo'))
    expect(onLoad).toHaveBeenCalledOnce()
    expect(onStatusChange).toHaveBeenLastCalledWith('ready')
  })

  it('shows the fallback when told the page failed', () => {
    render(
      <Device
        iframe="https://example.com"
        title="Demo"
        failed
        fallback={<p>Taking a break</p>}
      />,
    )
    expect(screen.queryByTitle('Demo')).toBeNull()
    expect(screen.getByText('Taking a break')).toBeInTheDocument()
  })

  describe('loadTimeout', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    const renderTimed = (props: { ready?: boolean } = {}) =>
      render(
        <Device
          iframe="https://example.com"
          title="Demo"
          loadTimeout={1000}
          fallback={<p>Taking a break</p>}
          {...props}
        />,
      )

    it('starts the clock when the device scrolls into view', () => {
      renderTimed()
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByTitle('Demo')).toBeInTheDocument()
      act(() => {
        for (const observer of intersectionObservers) observer.enter()
      })
      act(() => vi.advanceTimersByTime(1000))
      expect(screen.getByText('Taking a break')).toBeInTheDocument()
    })

    it('never fails once the page has loaded', () => {
      renderTimed()
      act(() => {
        for (const observer of intersectionObservers) observer.enter()
      })
      fireEvent.load(screen.getByTitle('Demo'))
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByTitle('Demo')).toBeInTheDocument()
    })

    it('counts an outside ready signal as loaded', () => {
      renderTimed({ ready: true })
      act(() => {
        for (const observer of intersectionObservers) observer.enter()
      })
      act(() => vi.advanceTimersByTime(5000))
      expect(screen.getByTitle('Demo')).toBeInTheDocument()
    })
  })
})
