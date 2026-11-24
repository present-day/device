import { defineConfig } from 'tsup'

// tsup's declaration build injects `baseUrl`, which TypeScript 6 rejects as
// deprecated (TS5101). Silence it here rather than in tsconfig so the
// tsconfig stays valid for editors running TypeScript 5.x.
const dtsCompilerOptions = { ignoreDeprecations: '6.0' }

export default defineConfig([
  {
    entry: { index: 'src/index.ts', styles: 'src/core/styles.css' },
    format: ['cjs', 'esm'],
    dts: {
      entry: { index: 'src/index.ts' },
      compilerOptions: dtsCompilerOptions,
    },
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    // The component is client-only, and every import of it needs the stylesheet.
    banner: ({ format }) =>
      format === 'esm'
        ? { js: '"use client";\nimport "./styles.css";' }
        : { js: '"use client";\nrequire("./styles.css");' },
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
  },
  {
    // No React, no stylesheet import, no "use client": safe on a server, in a
    // build script or in React Native.
    entry: { core: 'src/core/index.ts' },
    format: ['cjs', 'esm'],
    dts: {
      entry: { core: 'src/core/index.ts' },
      compilerOptions: dtsCompilerOptions,
    },
    sourcemap: true,
  },
])
