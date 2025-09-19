import "@/css/satoshi.css";
import "@/css/simple-datatables.css";
import "dropzone/dist/dropzone.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import "nouislider/dist/nouislider.css";

import "@/css/style.css";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | UPIIZ",
    default: "Plataforma Colaborativa",
  },
  description:
    "Plataforma colaborativa para apoyar el aprendizaje académico estudiantil en la UPIIZ.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#7e0737" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
