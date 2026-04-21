import type { NextConfig } from "next";

/**
 * Security headers — applied to all routes.
 * Defense-in-depth against XSS, clickjacking, MIME sniffing, referrer leak.
 */
const securityHeaders = [
  {
    // HSTS: force HTTPS for 1 year, include subdomains, allow preload list
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    // Clickjacking protection — không cho embed trong iframe
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // MIME sniffing protection
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Referrer policy — giữ privacy
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Permissions — tắt các capability không dùng
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    // Cross-origin isolation nhẹ (không chặn assets public)
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
