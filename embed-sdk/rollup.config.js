import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Main SDK bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/lynk-sdk.js',
        format: 'umd',
        name: 'LynkSDK',
        sourcemap: true
      },
      {
        file: 'dist/lynk-sdk.min.js',
        format: 'umd',
        name: 'LynkSDK',
        plugins: [terser()]
      },
      {
        file: 'dist/lynk-sdk.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  // Standalone Pixel bundle
  {
    input: 'src/pixel/index.ts',
    output: [
      {
        file: 'dist/lynk-pixel.js',
        format: 'umd',
        name: 'LynkPixel',
        sourcemap: true
      },
      {
        file: 'dist/lynk-pixel.min.js',
        format: 'umd',
        name: 'LynkPixel',
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  // Standalone Button bundle
  {
    input: 'src/button/index.ts',
    output: [
      {
        file: 'dist/lynk-button.js',
        format: 'umd',
        name: 'LynkButton',
        sourcemap: true
      },
      {
        file: 'dist/lynk-button.min.js',
        format: 'umd',
        name: 'LynkButton',
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  }
];