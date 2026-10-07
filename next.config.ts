import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return process.env.NEXT_PUBLIC_PACTSPLIT_CHAIN_ID === "5042"
      ? [
          {
            source: "/pay/5042002/:contract/:id",
            destination:
              "https://pactsplit-testnet.vercel.app/pay/5042002/:contract/:id",
            permanent: false,
          },
        ]
      : [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
