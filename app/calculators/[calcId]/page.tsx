// Server component
import { notFound } from "next/navigation";
import CalculatorTemplate from "./calculator-template";
import { getRateConfig, getRateMetadata } from "@/config/rates";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

// Create a server-side function to load the rate configuration
const loadRateConfig = unstable_cache(
	async (calcId: string) => {
		"use server";
		try {
			const config = await getRateConfig(calcId);
			if (!config) return null;

			return {
				...config,
				// Add display name for the calculator
				displayName: config.name,
			};
		} catch (error) {
			console.error(`Failed to load rate config for ${calcId}:`, error);
			return null;
		}
	},
	["rate-config"],
	{ revalidate: 3600 } // Revalidate every hour
);

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ calcId: string }> }): Promise<Metadata> {
	const { calcId } = await params;
	const config = await loadRateConfig(calcId);
	if (!config) return {};

	return {
		title: config.name,
		description: config.description,
	};
}

type PageParams = {
	calcId: string;
};

type SearchParams = {
	[key: string]: string | string[] | undefined;
};

type PageProps = {
	params: Promise<PageParams>;
	searchParams: Promise<SearchParams>;
};

export default async function Page({ params }: PageProps) {
	const { calcId } = await params;

	// Get the latest metadata
	const metadata = await getRateMetadata();

	// Check if the calculator exists in our registry
	const calculatorExists = metadata.some((calc) => calc.id === calcId);

	// If calculator doesn't exist, show 404
	if (!calculatorExists) {
		notFound();
	}

	// Pre-load the configuration on the server
	const rateConfig = await loadRateConfig(calcId);

	// If config couldn't be loaded, show 404
	if (!rateConfig) {
		notFound();
	}

	// Pass the serialized config to the client component
	return <CalculatorTemplate calcId={calcId} serviceType={rateConfig.serviceType} preloadedConfig={JSON.stringify(rateConfig)} />;
}

// Generate static params for all registered calculators
export async function generateStaticParams() {
	const metadata = await getRateMetadata();
	return metadata.map((calc) => ({
		calcId: calc.id,
	}));
}
