import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
