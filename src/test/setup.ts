import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { MockResizeObserver, resizeObservers } from './resizeObserver'

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver

afterEach(() => {
  cleanup()
  resizeObservers.clear()
})

export const intersectionObservers = new Set<MockIntersectionObserver>()

export class MockIntersectionObserver {
  readonly targets = new Set<Element>()

  constructor(private readonly callback: IntersectionObserverCallback) {
    intersectionObservers.add(this)
  }

  observe(target: Element) {
    this.targets.add(target)
  }

  unobserve(target: Element) {
    this.targets.delete(target)
  }

  disconnect() {
    this.targets.clear()
    intersectionObservers.delete(this)
  }

  /** Simulates the observed elements scrolling into view. */
  enter() {
    this.callback(
      [...this.targets].map(
        (target) =>
          ({ target, isIntersecting: true }) as IntersectionObserverEntry,
      ),
      this as unknown as IntersectionObserver,
    )
  }
}

globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver

afterEach(() => intersectionObservers.clear())
