import type { NextConfig } from "next";

// GitHub Pages serves a project site from /<repo>, so the build needs a
// basePath there but must not have one locally. The deploy workflow sets this;
// `npm run dev` leaves it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Zero-cost by design: no server, no database, no API keys.
// Everything lives in the browser's localStorage, so the whole app ships as
// static HTML/CSS/JS and can be hosted free on GitHub Pages, Netlify, or Vercel.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
};

export default nextConfig;
