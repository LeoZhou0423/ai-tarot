import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Allow access to public pages
      const path = req.nextUrl.pathname;
      if (path === "/" || path === "/login" || path === "/signup") {
        return true;
      }
      // Protect reading and API routes
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/reading/:path*", "/api/reading/:path*"],
};
