import { createCache } from "./cache";
import type { CalculatorState } from "@/types";

/**
 * Get the default calculator state for a specific service type
 * This function is cached on the server to improve performance
 */
export const getDefaultCalculatorState = createCache(
	async (serviceType: string): Promise<CalculatorState | null> => {
		// In a real application, this could fetch from a database or API
		// For now, we'll return null as the actual implementation is in the client components
		console.log(`Fetching calculator state for ${serviceType}`);
		return null;
	},
	["calculator-state"],
	{ revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get calculator metadata for all service types
 * This function is cached on the server to improve performance
 */
export const getCalculatorMetadata = createCache(
	async () => {
		return [
			{
				id: "residential",
				title: "Residential",
				description: "Standard residential service rates for homes",
				icon: "Home",
				color: "blue",
			},
			{
				id: "property-management",
				title: "Property Management",
				description: "Rates for property management contracts",
				icon: "Building2",
				color: "indigo",
			},
			{
				id: "single-family",
				title: "Single Family",
				description: "Rates for single family home services",
				icon: "Home",
				color: "green",
			},
			{
				id: "septic",
				title: "Septic",
				description: "Rates for septic installation and maintenance",
				icon: "ReceiptText",
				color: "purple",
			},
			{
				id: "commercial",
				title: "Commercial",
				description: "Rates for commercial service contracts",
				icon: "Warehouse",
				color: "amber",
			},
		];
	},
	["calculator-metadata"],
	{ revalidate: 86400 } // Cache for 24 hours
);

/**
 * Get estimate template metadata
 * This function is cached on the server to improve performance
 */
export const getEstimateTemplateMetadata = createCache(
	async () => {
		return [
			{
				id: "new",
				title: "Create New Estimate",
				description: "Start a blank estimate for any job",
				icon: "FilePlus2",
				color: "blue",
				buttonText: "Create Estimate",
			},
			{
				id: "tankless-water-heater",
				title: "Tankless Water Heater",
				description: "Tankless water heater installation template",
				icon: "Flame",
				color: "orange",
				buttonText: "Use Template",
			},
			{
				id: "standard-water-heater",
				title: "Standard Water Heater",
				description: "Standard water heater replacement template",
				icon: "Droplets",
				color: "blue",
				buttonText: "Use Template",
			},
			{
				id: "enhanced-septic-system",
				title: "Enhanced Septic System",
				description: "Enhanced septic system installation template",
				icon: "ReceiptText",
				color: "green",
				buttonText: "Use Template",
			},
			{
				id: "saved",
				title: "Saved Estimates",
				description: "View all of your saved estimates",
				icon: "FileText",
				color: "gray",
				buttonText: "View Saved",
			},
		];
	},
	["estimate-template-metadata"],
	{ revalidate: 86400 } // Cache for 24 hours
);
