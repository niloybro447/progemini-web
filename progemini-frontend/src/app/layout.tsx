import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      'https://progeminiacademy.com'
  ),
  title: "Progemini Academy - Empowering Generations to Lead",
  description: "Undergraduate and Postgraduate Degrees to Executive Corporate Learning Programmes. Progemini Academy equips you with the expert-led skills and Knowledge to lead.",
  keywords: ["MBA", "Doctorate Degree", "UK accredited", "Business Management courses", "career development"],
  authors: [{ name: "Progemini Academy" }],
  icons: {
    icon: "/fab-icon.gif",
    apple: "/fab-icon.gif",
    shortcut: "/fab-icon.gif",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://progeminiacademy.com",
    siteName: "Progemini Academy",
    title: "Progemini Academy - Empowering Generations to Lead",
    description: "Undergraduate and Postgraduate Degrees to Executive Corporate Learning Programmes. Progemini Academy equips you with the expert-led skills and Knowledge to lead.",
    images: [
      {
        url: "/Progemini-trans-logo.gif",
        width: 800,
        height: 800,
        alt: "Progemini Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Progemini Academy - Empowering Generations to Lead",
    description: "Undergraduate and Postgraduate Degrees to Executive Corporate Learning Programmes. Progemini Academy equips you with the expert-led skills and Knowledge to lead.",
    images: ["/Progemini-trans-logo.gif"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <Toaster position="top-right" />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
