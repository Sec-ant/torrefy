import webpack from "webpack";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import pkg from "./package.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 *
 * @param {"esm"|"umd"} type
 * @returns
 */
function getConfig(type) {
  return {
    mode: "production",
    entry: {
      index: resolve(__dirname, "src/index.ts"),
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            ...(type === "umd" && {
              options: {
                compilerOptions: {
                  declaration: false,
                },
              },
            }),
          },
          exclude: [resolve(__dirname, "node_modules")],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
      extensionAlias: {
        ".js": [".ts", ".js"],
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        CREATED_BY: JSON.stringify(`${pkg.name} v${pkg.version}`),
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    output:
      type === "umd"
        ? {
            filename: "[name].umd.js",
            path: resolve(__dirname, "dist"),
            library: {
              name: "torrefy",
              type: "umd",
            },
          }
        : {
            filename: "[name].js",
            path: resolve(__dirname, "dist"),
            library: {
              type: "module",
            },
            chunkFormat: "module",
          },
    experiments: {
      outputModule: type === "umd" ? false : true,
    },
    target: "web",
  };
}

/**
 * Webpack Configuration
 * @type { webpack.Configuration }
 */
export default [getConfig("esm"), getConfig("umd")];
