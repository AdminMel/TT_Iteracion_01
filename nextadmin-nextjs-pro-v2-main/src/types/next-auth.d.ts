import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    /** ID real del User en BD (cuid) */
    userId?: string;
    user: {
      id?: string;         // reflejo del cuid
      roles?: string[];
      boleta?: string;
      nombre?: string;
      carrera?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;   // cuid
    roles?: string[];
    boleta?: string;
    nombre?: string;
    carrera?: string;
  }
}
