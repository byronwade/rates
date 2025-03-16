// Server component
import { notFound } from "next/navigation";
import EstimateTemplate from "./estimate-template";
import { getTemplateConfig, getTemplateMetadata } from "@/config/estimates";
import { unstable_cache } from "next/cache";
import { EnhancedLineItem } from "@/components/estimates/template-engine";

// Set of common hourly rates to pre-compute line items for
const COMMON_HOURLY_RATES = [75, 100, 125, 150, 175, 200, 225, 250];

// Server function to fetch template metadata
async function fetchTemplateMetadata() {
	"use server";
	return await getTemplateMetadata();
}

// Create a server-side function to load the template configuration
const loadTemplateConfig = unstable_cache(
	async (estimateId: string) => {
		"use server";
		try {
			// Use the existing function from config/estimates
			const config = await getTemplateConfig(estimateId);

			// Return null if config couldn't be loaded
			if (!config) return null;

			// Pre-calculate line items for common hourly rates
			const precomputedLineItems: Record<string, EnhancedLineItem[]> = {};

			// Generate line items for common hourly rates
			COMMON_HOURLY_RATES.forEach((rate) => {
				try {
					if (typeof config.defaultLineItems === "function") {
						precomputedLineItems[rate.toString()] = config.defaultLineItems(rate);
					}
				} catch (err) {
					console.error(`Error generating line items for rate ${rate}:`, err);
				}
			});

			// Prepare the config for serialization by extracting icon information
			return {
				...config,
				// Include the icon's displayName so we can map it back on the client
				icon: {
					displayName: config.icon.displayName || config.icon.name || "Wrench",
				},
				// Process categories to include displayName for each icon
				categories: config.categories.map((category) => ({
					...category,
					icon: {
						displayName: category.icon.displayName || category.icon.name || "Package",
					},
				})),
				// Replace the function with pre-computed data
				defaultLineItems: precomputedLineItems,
				// Flag to indicate this is a serialized config with pre-computed line items
				isSerializedConfig: true,
			};
		} catch (error) {
			console.error(`Failed to load template config for ${estimateId}:`, error);
			return null;
		}
	},
	["template-config"],
	{ revalidate: 3600 } // Revalidate every hour
);

type PageParams = {
	estimateId: string;
};

type SearchParams = {
	[key: string]: string | string[] | undefined;
};

type PageProps = {
	params: Promise<PageParams>;
	searchParams: Promise<SearchParams>;
};

// This component is a server component
export default async function Page({ params }: PageProps) {
	const { estimateId } = await params;

	// Get the latest metadata
	const metadata = await fetchTemplateMetadata();

	// Check if the template exists in our registry
	const templateExists = metadata.some((template) => template.id === estimateId);

	// If template doesn't exist, show 404
	if (!templateExists) {
		notFound();
	}

	// Pre-load the configuration on the server
	const templateConfig = await loadTemplateConfig(estimateId);

	// If config couldn't be loaded, show 404
	if (!templateConfig) {
		notFound();
	}

	// Pass the serialized config to the client component
	return <EstimateTemplate estimateId={estimateId} preloadedConfig={JSON.stringify(templateConfig)} />;
}

// Generate static params for all registered templates
export async function generateStaticParams() {
	// Get the latest metadata for static path generation
	const metadata = await fetchTemplateMetadata();

	return metadata.map((template) => ({
		estimateId: template.id,
	}));
}
