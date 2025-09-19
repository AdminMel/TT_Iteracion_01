// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!auth/signin|api/auth|_next|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
