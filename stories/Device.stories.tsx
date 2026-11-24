import type { Meta, StoryObj } from '@storybook/react-vite'

import { Device, deviceHTML } from '../src'
import { PHONE_PAGE, PHONE_SCREEN, TABLET_SCREEN } from './screens'

const meta = {
  title: 'Device',
  component: Device,
  args: { device: 'phone', interactive: false },
  argTypes: {
    device: { control: 'inline-radio', options: ['phone', 'tablet'] },
    cutout: { control: 'inline-radio', options: [undefined, 'island', 'none'] },
  },
  parameters: { width: 320 },
  decorators: [
    (Story, context) => (
      <div
        style={{
          width: context.parameters.width,
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Device>

export default meta
type Story = StoryObj<typeof meta>

export const Screenshot: Story = {
  args: { src: PHONE_SCREEN, alt: 'A list of nearby places' },
}

export const EmbeddedPage: Story = {
  args: { iframe: PHONE_PAGE, title: 'An embedded page', interactive: true },
}

export const Fallback: Story = {
  args: {
    iframe: 'about:blank',
    title: 'A page that failed to load',
    failed: true,
    fallback: (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          color: '#fff',
          font: '600 24px system-ui',
        }}
      >
        The live demo is taking a break.
      </div>
    ),
  },
}

export const Children: Story = {
  args: {
    children: (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          background: 'linear-gradient(#34c76f, #0f1512)',
          color: '#fff',
          font: '800 28px system-ui',
        }}
      >
        Any content
      </div>
    ),
  },
}

export const Tablet: Story = {
  args: { device: 'tablet', src: TABLET_SCREEN, alt: 'A countdown at 3' },
  parameters: { width: 640 },
}

export const MaxHeight: Story = {
  name: 'Max height (40vh)',
  args: {
    src: PHONE_SCREEN,
    alt: 'A list of nearby places',
    maxHeight: '40vh',
  },
}

/** The same frame from `deviceHTML`, for pages rendered without React. */
export const StaticHTML: Story = {
  render: () => (
    <div
      // biome-ignore lint/security/noDangerouslySetInnerHtml: deviceHTML escapes its input
      dangerouslySetInnerHTML={{
        __html: deviceHTML({
          src: PHONE_SCREEN,
          alt: 'A list of nearby places',
        }),
      }}
    />
  ),
}
