/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["nextjs-ribs"],
  turbopack: {
    // Include parent dir so Turbopack can resolve linked package at ../../libraries/nextjs-ribs
    root: path.join(__dirname, "..", ".."),
  },
};

export default config;
