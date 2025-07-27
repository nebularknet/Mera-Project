import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "./custom.css";
import "./blog.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Providers } from "./providers";
import CustomNavbar from "@/components/CustomNavbar";

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nebulark - Designing Solutions",
  description: "Creative design agency specializing in innovative solutions for modern businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} antialiased font-sans`}>
        <Providers>
          <CustomNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
