// src/app/layout.tsx - FIXED with global theme provider
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { generateSEO, structuredData } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Import theme providers
import ThemeProvider from "@/theme";
import { SettingsProvider } from "@/components/settings";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const roboto = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
	weight: ["300", "400", "500", "700"],
	display: "swap",
});

export const metadata: Metadata = generateSEO();

// Default settings for the theme
const DEFAULT_SETTINGS = {
	themeMode: 'light',
	themeDirection: 'ltr',
	themeContrast: 'default',
	themeLayout: 'vertical',
	themeColorPresets: 'default',
	themeStretch: false,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en-KE">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData.organization),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData.website),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData.ecommerce),
					}}
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="msapplication-TileColor" content="#2563eb" />
				<meta name="theme-color" content="#ffffff" />
			</head>
			<body className={`${inter.variable} ${roboto.variable} antialiased`}>
				{/* 🔥 THE FIX: Wrap everything with theme providers */}
				<SettingsProvider defaultSettings={DEFAULT_SETTINGS}>
					<ThemeProvider>
						<div id="root">{children}</div>
					</ThemeProvider>
				</SettingsProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}