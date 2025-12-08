// src/app/page.tsx
import { generateSEO } from "@/lib/seo";
import MainLayout from "@/components/layout/main-layout";

import HeroSection from "@/components/sections/hero/hero-section";
import FeaturesSection from "@/components/sections/features/features-section";
import ProductShowcaseSection from "@/components/sections/products/product-showcase-section";
import StatsSection from "@/components/sections/stats/stats-section";
import TestimonialsSection from "@/components/sections/testimonials/testimonials-section";
import CtaSection from "@/components/sections/cta/cta-section";
import PartnersSection from "@/components/sections/partners/partners-section";

export const metadata = generateSEO({
	title: "Kenya's Premier B2B E-commerce Platform",
	description:
		"Revolutionizing retail in Kenya through streamlined access to essential goods, efficient inventory management, and reliable same-day delivery across Nairobi.",
	keywords: [
		"B2B e-commerce Kenya",
		"wholesale goods Nairobi",
		"retail suppliers Kenya",
		"essential goods distribution",
		"inventory management Kenya",
		"same-day delivery Nairobi",
		"small business suppliers Kenya",
		"retail platform Kenya",
		"wholesale marketplace Africa",
		"business goods Kenya",
	],
});

export default function HomePage() {
	return (
		<MainLayout>
			<HeroSection />
			<FeaturesSection />
			<ProductShowcaseSection />
			<StatsSection />
			<TestimonialsSection />
			<PartnersSection />
			<CtaSection />
		</MainLayout>
	);
}
