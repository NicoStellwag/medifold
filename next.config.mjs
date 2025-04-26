/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable output file tracing for Netlify
  output: "standalone",
  // Add Netlify deployment optimization
  poweredByHeader: false,
  // Increase build memory limit
  experimental: {
    // Ensure we have environment variables during build
    forceSwcTransforms: true,
  },
  env: {
    // Add fallbacks for critical environment variables
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "placeholder",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
  },
};

export default nextConfig;
