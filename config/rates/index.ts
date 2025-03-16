import { ServiceType } from "@/components/rate-calculators";
import { unstable_cache } from "next/cache";

// Define worker interface for configuration
export interface WorkerConfig {
	title: string;
	hourlyRate: number;
	commission: number;
}

// Define crew interface for configuration
export interface CrewConfig {
	name: string;
	workers: WorkerConfig[];
}

// Define office staff interface for configuration
export interface OfficeStaffConfig {
	title: string;
	payType: "hourly" | "salary";
	hourlyRate: number;
	monthlySalary: number;
}

// Define overhead cost interface for configuration
export interface OverheadCostConfig {
	name: string;
	monthlyCost: number;
}

// Define the rate calculator configuration type
export interface RateCalculatorConfig {
	id: string;
	name: string;
	description: string;
	category: string;
	serviceType: ServiceType;

	// Basic rate parameters
	wastagePercent: number;
	desiredMargin: number;
	commissionEnabled: boolean;

	// Work hour configuration
	dailyWorkHours: number;
	dailyBillableHours: number;
	monthlyBillableHours?: number;

	// Crew configuration
	defaultCrewCount: number;
	defaultCrews: CrewConfig[];

	// Office staff configuration
	defaultOfficeStaff: OfficeStaffConfig[];

	// Overhead configuration
	defaultOverheadCosts: OverheadCostConfig[];

	// UI defaults
	showComparisons?: boolean;
	showExplanation?: boolean;
	showOfficeStaffSection?: boolean;
	showOverheadSection?: boolean;
}

// Define the metadata type for easier reuse
export type RateMetadataItem = {
	id: string;
	name: string;
	description: string;
	category: string;
	serviceType: ServiceType;
};

// Define available rate configurations
const AVAILABLE_RATES = ["residential-plumbing", "commercial-plumbing", "property-management", "septic-service", "single-family-service"] as const;

// Dynamically build the rates record based on the available rates
export const rates: Record<string, () => Promise<{ default: RateCalculatorConfig }>> = AVAILABLE_RATES.reduce((acc, id) => {
	acc[id] = () => import(`./${id}`);
	return acc;
}, {} as Record<string, () => Promise<{ default: RateCalculatorConfig }>>);

// Cache the metadata loading for performance
export const loadRateMetadata = unstable_cache(
	async (): Promise<RateMetadataItem[]> => {
		const metadata: RateMetadataItem[] = [];

		// Load each rate configuration to extract metadata
		for (const id of AVAILABLE_RATES) {
			try {
				const rateLoader = rates[id];
				if (rateLoader) {
					const rateModule = await rateLoader();
					const config = rateModule.default;

					metadata.push({
						id,
						name: config.name,
						description: config.description,
						category: config.category || "other",
						serviceType: config.serviceType,
					});
				}
			} catch (error) {
				console.error(`Error loading metadata for rate ${id}:`, error);
			}
		}

		// Sort by name for consistency
		return metadata.sort((a, b) => a.name.localeCompare(b.name));
	},
	["rate-metadata"],
	{ revalidate: 3600 } // Revalidate cache every hour
);

// Helper function to get rate configuration by ID
export async function getRateConfig(rateId: string): Promise<RateCalculatorConfig | null> {
	const rateLoader = rates[rateId];
	if (!rateLoader) {
		console.error(`Rate configuration not found for ID: ${rateId}`);
		return null;
	}

	try {
		const rateModule = await rateLoader();
		return rateModule.default;
	} catch (error) {
		console.error(`Error loading rate configuration for ${rateId}:`, error);
		return null;
	}
}

// Helper function to get the most up-to-date rate metadata
export async function getRateMetadata(): Promise<RateMetadataItem[]> {
	// This function should only be called from server components
	if (typeof window !== "undefined") {
		console.error("getRateMetadata() should only be called from server components");
		return [];
	}

	try {
		return await loadRateMetadata();
	} catch (error) {
		console.error("Error loading rate metadata:", error);
		return [];
	}
}
