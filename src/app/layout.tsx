import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const ttCommons = localFont({
  src: [
    {
      path: "../../public/fonts/TT Commons Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/TT Commons Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/TT Commons Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/TT Commons Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/TT Commons Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viscora AI — Heavy Oil Well-to-Surface Digital Twin",
  description:
    "AI-enabled Well-to-Surface Digital Twin for Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) optimization in Baghewala heavy oil wells. Oil India Limited.",
  keywords: [
    "Viscora AI",
    "digital twin",
    "cyclic steam stimulation",
    "sucker rod pump",
    "heavy oil",
    "Baghewala",
    "Oil India Limited",
    "viscosity optimization",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "256x256", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ttCommons.variable} ${geistMono.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
