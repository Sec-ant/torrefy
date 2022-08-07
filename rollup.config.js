import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";

import pkg from "./package.json";

const plugins = [
  replace({
    "process.env.NODE_ENV": JSON.stringify("production"),
    preventAssignment: true,
  }),
  nodeResolve(), // so Rollup can find node modules
  commonjs(), // so Rollup can convert node modules to an ES module
  typescript({ tsconfig: "./tsconfig.json" }), // so Rollup can convert TypeScript to JavaScript
  json(),
  terser(),
];

export default [
  // browser-friendly UMD build
  {
    input: "src/index.ts",
    output: {
      sourcemap: true,
      file: pkg.browser,
      format: "umd",
      name: "bepjs",
    },
    plugins,
  },

  // ES module (for bundlers) build
  {
    input: "src/index.ts",
    external: ["workbox-streams", "uuid"],
    output: [{ file: pkg.module, format: "es", sourcemap: true }],
    plugins,
  },
];
