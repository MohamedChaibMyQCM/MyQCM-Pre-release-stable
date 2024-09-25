import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fr"],
  defaultLocale: "en",
});

export const config = {
  matcher: ["/", "/(fr)/:path*"],
};