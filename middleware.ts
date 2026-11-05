import { withAuth } from "next-auth/middleware";
export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const p = req.nextUrl.pathname;
      if (p.startsWith("/admin")) return token?.role === "ADMIN";
      if (p.startsWith("/vendor/apply")) return !!token;
      if (p.startsWith("/vendor")) return token?.role === "VENDOR" || token?.role === "ADMIN";
      return !!token; // /checkout, /orders
    },
  },
});
export const config = { matcher: ["/admin/:path*", "/vendor/:path*", "/checkout", "/orders/:path*"] };
