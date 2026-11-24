import clsx from 'clsx'
import {
  type CSSProperties,
  type IframeHTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import {
  type Cutout,
  type DeviceName,
  type DeviceSpec,
  deviceVars,
  resolveDevice,
} from '../core/devices'

export type DeviceStatus = 'loading' | 'ready' | 'failed'

export interface DeviceProps {
  /** A preset or your own spec. Defaults to `phone`. */
  device?: DeviceName | DeviceSpec
  /** Defaults to the device's own cutout, except over an iframe, where the
   * embedded page has no safe area and the island would cover its header. */
  cutout?: Cutout
  /** Any CSS length. The width shrinks so the whole device fits. */
  maxHeight?: string
  className?: string
  style?: CSSProperties

  /** A screenshot, drawn at the screen's size. */
  src?: string
  alt?: string
  imgProps?: ImgHTMLAttributes<HTMLImageElement>

  /** A page, laid out at the device's viewport and scaled to the screen. Takes
   * precedence over `src` and `children`. */
  iframe?: string
  /** Required with `iframe`; the frame's accessible name. */
  title?: string
  iframeProps?: IframeHTMLAttributes<HTMLIFrameElement>

  /** Anything else on the screen. */
  children?: ReactNode
  /** `screen` (default) draws children at the screen's size; `viewport` lays
   * them out at the device's viewport and scales them, like an iframe. */
  fit?: 'screen' | 'viewport'

  /** Lets pointer events reach the screen content. Off by default, so an
   * embedded page never traps a scroll gesture; an off iframe also leaves
   * the tab order. */
  interactive?: boolean
  /** Drawn over the screen at the screen's size, e.g. a poster until the
   * embedded page has drawn. Stays interactive. */
  overlay?: ReactNode

  /** Replaces the iframe, laid out at the viewport, once it has failed. */
  fallback?: ReactNode
  /** Milliseconds the iframe gets to load after it first scrolls into view
   * before it counts as failed. No timeout when omitted. */
  loadTimeout?: number
  /** Marks the iframe loaded, for pages that report it themselves (say with
   * `postMessage`) because `load` can fire before hydration. */
  ready?: boolean
  /** Marks the iframe failed and shows `fallback`. */
  failed?: boolean
  onStatusChange?: (status: DeviceStatus) => void
}

const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A device frame around a screenshot, an embedded page or any content, drawn
 * in CSS from the proportions in `DEVICES`. Give it a width (or `maxHeight`);
 * the height follows from the device's shape.
 */
export function Device({
  device = 'phone',
  cutout,
  maxHeight,
  className,
  style,
  src,
  alt = '',
  imgProps,
  iframe,
  title,
  iframeProps,
  children,
  fit = 'screen',
  interactive = false,
  overlay,
  fallback,
  loadTimeout,
  ready,
  failed,
  onStatusChange,
}: DeviceProps) {
  const spec = resolveDevice(device)
  const shownCutout = cutout ?? (iframe ? 'none' : spec.cutout)
  const rootRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const status = useLoadStatus({
    active: !!iframe,
    rootRef,
    loadTimeout,
    ready,
    failed,
    onStatusChange,
  })
  const scaled = !!iframe || fit === 'viewport'

  useIsoLayoutEffect(() => {
    const screen = screenRef.current
    if (!scaled || !screen) return
    const measure = () => {
      if (!screen.clientWidth) return
      screen.style.setProperty(
        '--pd-device-scale',
        String(screen.clientWidth / spec.viewport.width),
      )
      screen.dataset.scaled = ''
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [scaled, spec.viewport.width])

  const viewportStyle = {
    width: spec.viewport.width,
    height: spec.viewport.height,
  }

  let content: ReactNode
  if (iframe && status.value === 'failed') {
    content = fallback ? (
      <div className="pd-device-viewport" style={viewportStyle}>
        {fallback}
      </div>
    ) : null
  } else if (iframe) {
    const { onLoad, ...rest } = iframeProps ?? {}
    content = (
      <iframe
        src={iframe}
        title={title}
        loading="lazy"
        tabIndex={interactive ? undefined : -1}
        {...rest}
        onLoad={(event) => {
          status.markLoaded()
          onLoad?.(event)
        }}
        className={clsx('pd-device-viewport pd-device-content', rest.className)}
        style={{ ...viewportStyle, ...rest.style }}
      />
    )
  } else if (src) {
    content = (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        {...imgProps}
        className={clsx('pd-device-fill', imgProps?.className)}
      />
    )
  } else if (children != null) {
    content =
      fit === 'viewport' ? (
        <div
          className="pd-device-viewport pd-device-content"
          style={viewportStyle}
        >
          {children}
        </div>
      ) : (
        <div className="pd-device-fill pd-device-content">{children}</div>
      )
  }

  return (
    <div
      ref={rootRef}
      className={clsx('pd-device', className)}
      data-interactive={interactive}
      data-status={iframe ? status.value : undefined}
      style={
        {
          ...deviceVars(spec, { cutout: shownCutout, maxHeight }),
          ...style,
        } as CSSProperties
      }
    >
      <div className="pd-device-body">
        {spec.buttons.map((button) => (
          <span
            key={`${button.side}-${button.start}`}
            className="pd-device-button"
            data-side={button.side}
            style={
              {
                '--pd-device-button-start': `${button.start * 100}%`,
                '--pd-device-button-length': `${button.length * 100}%`,
              } as CSSProperties
            }
          />
        ))}
        <div ref={screenRef} className="pd-device-screen">
          {content}
          {overlay != null ? (
            <div className="pd-device-fill">{overlay}</div>
          ) : null}
          {shownCutout === 'island' ? (
            <span className="pd-device-island" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * `loading` until the iframe fires `load` (or `ready` is passed), `failed` if
 * `loadTimeout` runs out first. Once ready it never regresses: a slow
 * navigation inside the page is not an outage. The clock starts when the
 * device first scrolls into view, since the iframe loads lazily.
 */
function useLoadStatus({
  active,
  rootRef,
  loadTimeout,
  ready,
  failed,
  onStatusChange,
}: {
  active: boolean
  rootRef: RefObject<HTMLDivElement | null>
  loadTimeout?: number
  ready?: boolean
  failed?: boolean
  onStatusChange?: (status: DeviceStatus) => void
}) {
  const [own, setOwn] = useState<DeviceStatus>('loading')
  const value: DeviceStatus = failed
    ? 'failed'
    : ready || own === 'ready'
      ? 'ready'
      : own

  const onChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onChangeRef.current = onStatusChange
  })
  useEffect(() => {
    if (active) onChangeRef.current?.(value)
  }, [active, value])

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  })

  useEffect(() => {
    const root = rootRef.current
    if (!active || !loadTimeout || !root) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        timer = setTimeout(() => {
          if (valueRef.current === 'loading') setOwn('failed')
        }, loadTimeout)
      },
      { threshold: 0.1 },
    )
    observer.observe(root)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [active, loadTimeout, rootRef])

  return {
    value,
    markLoaded: () => setOwn((s) => (s === 'loading' ? 'ready' : s)),
  }
}
