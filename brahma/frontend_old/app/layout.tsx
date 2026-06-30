import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";



export const metadata: Metadata = {
  title:
    "BRAHMA - Biomedical Research Assistant for Hypothesis Modeling and Analysis",
  description: "Accelerate Biomedical Discovery with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
