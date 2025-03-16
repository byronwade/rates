import { EstimateTemplateConfig } from "@/components/estimates/template-engine";
import { unstable_cache } from "next/cache";

// Import types only for type-checking, not the actual implementations
// This helps with tree-shaking and performance
type TemplateModule = Promise<{ default: EstimateTemplateConfig }>;

// Define the metadata type for easier reuse
export type TemplateMetadataItem = {
	id: string;
	name: string;
	description: string;
	category: string;
};

// Define available template IDs explicitly
// When adding a new template, just add its ID to this array
const TEMPLATE_IDS = ["enviroserver-es-450", "standard-water-heater", "tankless-water-heater"];

// Dynamically build the templates record based on the explicit list
export const templates: Record<string, () => TemplateModule> = TEMPLATE_IDS.reduce((acc, id) => {
	acc[id] = () => import(`./${id}`);
	return acc;
}, {} as Record<string, () => TemplateModule>);

// Cache the metadata loading for performance
export const loadTemplateMetadata = unstable_cache(
	async (): Promise<TemplateMetadataItem[]> => {
		const metadata: TemplateMetadataItem[] = [];

		// Load each template to extract metadata
		for (const id of TEMPLATE_IDS) {
			try {
				const templateLoader = templates[id];
				if (templateLoader) {
					const templateModule = await templateLoader();
					const config = templateModule.default;

					metadata.push({
						id,
						name: config.name,
						description: config.description,
						category: config.id.split("-")[0] || "other", // Extract category from ID or use default
					});
				}
			} catch (error) {
				console.error(`Error loading metadata for template ${id}:`, error);
			}
		}

		// Sort by name for consistency
		return metadata.sort((a, b) => a.name.localeCompare(b.name));
	},
	["template-metadata"],
	{ revalidate: 3600 } // Revalidate cache every hour
);

// Template metadata for displaying in UI without loading the full configuration
// Use the cached function but provide a fallback for static rendering
export const templateMetadata: TemplateMetadataItem[] = [
	// This fallback data will be replaced by the dynamically loaded data at runtime
	// but ensures the page renders correctly during build time
	{
		id: "enviroserver-es-450",
		name: "EnviroServer ES Series 450 GPD System",
		description: "Installation estimate for EnviroServer ES Series 450 GPD septic system",
		category: "septic",
	},
	{
		id: "standard-water-heater",
		name: "Standard Water Heater",
		description: "Replacement estimate for standard tank water heater",
		category: "plumbing",
	},
	{
		id: "tankless-water-heater",
		name: "Tankless Water Heater",
		description: "Installation estimate for tankless water heater with upgrades",
		category: "plumbing",
	},
];

// Helper function to get template configuration by ID
export async function getTemplateConfig(estimateId: string): Promise<EstimateTemplateConfig | null> {
	const templateLoader = templates[estimateId];
	if (!templateLoader) {
		console.error(`Template configuration not found for ID: ${estimateId}`);
		return null;
	}

	try {
		const template = await templateLoader();
		return template.default;
	} catch (error) {
		console.error(`Error loading template configuration for ${estimateId}:`, error);
		return null;
	}
}

// Helper function to get the most up-to-date template metadata
export async function getTemplateMetadata(): Promise<TemplateMetadataItem[]> {
	try {
		return await loadTemplateMetadata();
	} catch (error) {
		console.error("Error loading template metadata:", error);
		return templateMetadata; // Fall back to static data if dynamic loading fails
	}
}
