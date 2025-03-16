"use client";

import { Suspense, useEffect, useState } from "react";
import { TemplatePageLayout } from "@/components/layout/template-page-layout";
import EstimateTemplateEngine from "@/components/estimates/template-engine";
import { EstimateTemplateConfig, CategoryConfig, EnhancedLineItem } from "@/components/estimates/template-engine";
import { Clock, Package, Bolt, Building, Users, Wrench, Droplets, Flame } from "lucide-react";

// Map to convert icon string names back to actual React components
const iconMap: Record<string, React.ComponentType> = {
	Clock,
	Package,
	Bolt,
	Building,
	Users,
	Wrench,
	Droplets,
	Flame,
};

// Types for serialized config
interface SerializedIcon {
	displayName: string;
}

interface SerializedCategory extends Omit<CategoryConfig, "icon"> {
	icon: SerializedIcon;
}

interface SerializedConfig extends Omit<EstimateTemplateConfig, "icon" | "categories" | "defaultLineItems"> {
	icon: SerializedIcon;
	categories: SerializedCategory[];
	defaultLineItems: Record<string, EnhancedLineItem[]>;
	isSerializedConfig: boolean;
}

interface EstimateTemplateProps {
	estimateId: string;
	preloadedConfig: string;
}

export default function EstimateTemplate({ estimateId, preloadedConfig }: EstimateTemplateProps) {
	// Parse the preloaded config
	const [config, setConfig] = useState<EstimateTemplateConfig | null>(null);

	useEffect(() => {
		try {
			// Parse the JSON string back to an object
			const parsedConfig = JSON.parse(preloadedConfig) as SerializedConfig;

			// Create a function that returns the precomputed line items based on hourly rate
			const getLineItems = (hourlyRate: number): EnhancedLineItem[] => {
				// Find the closest rate we have precomputed items for
				const availableRates = Object.keys(parsedConfig.defaultLineItems)
					.map(Number)
					.sort((a, b) => a - b);

				// Use exact match if available
				if (parsedConfig.defaultLineItems[hourlyRate.toString()]) {
					return parsedConfig.defaultLineItems[hourlyRate.toString()];
				}

				// Find closest rate
				const closestRate = availableRates.reduce((prev, curr) => (Math.abs(curr - hourlyRate) < Math.abs(prev - hourlyRate) ? curr : prev));

				// Return items for closest rate
				return parsedConfig.defaultLineItems[closestRate.toString()] || [];
			};

			// Process the icon references to convert them back to React components
			const processedConfig: EstimateTemplateConfig = {
				...parsedConfig,
				// Map the main icon
				icon: iconMap[parsedConfig.icon?.displayName || "Wrench"] || Wrench,
				// Map category icons
				categories:
					parsedConfig.categories?.map((category) => ({
						...category,
						icon: iconMap[category.icon?.displayName || "Package"] || Package,
					})) || [],
				// Create a function wrapper around the precomputed line items
				defaultLineItems: getLineItems,
			};

			setConfig(processedConfig);
		} catch (error) {
			console.error("Error parsing preloaded config:", error);
		}
	}, [preloadedConfig]);

	if (!config) {
		return (
			<TemplatePageLayout>
				<div className="animate-pulse h-screen w-full bg-muted/20"></div>
			</TemplatePageLayout>
		);
	}

	return (
		<TemplatePageLayout>
			<Suspense fallback={<div className="animate-pulse h-screen w-full bg-muted/20"></div>}>
				<EstimateTemplateEngine estimateId={estimateId} preloadedConfig={config} />
			</Suspense>
		</TemplatePageLayout>
	);
}
