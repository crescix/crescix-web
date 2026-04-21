import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrescIX",
  description: "Gestão inteligente para o seu negócio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body
        className={`${plusJakartaSans.variable} ${poppins.variable} antialiased dark`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
