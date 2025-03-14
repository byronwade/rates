import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Rates Pro - Job Profitability Calculator",
	description: "Calculate rates and create estimates for service businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
				<NavBar />
				<main className="container mx-auto py-6 px-4 md:px-6">{children}</main>
			</body>
		</html>
  );
}
