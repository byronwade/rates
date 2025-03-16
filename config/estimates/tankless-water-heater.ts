import { EstimateTemplateConfig, EnhancedLineItem } from "@/components/estimates/template-engine";
import { Clock, Package, Flame } from "lucide-react";

// Template configuration for Tankless Water Heater Installation
const TanklessWaterHeaterConfig: EstimateTemplateConfig = {
	id: "tankless-water-heater",
	name: "Tankless Water Heater Installation",
	icon: Flame, // Using Flame as the primary icon
	description: "Estimate template for installing a new tankless water heater with required upgrades.",
	defaultProjectName: "Tankless Water Heater Installation",
	defaultMaterialMarkup: 40,

	// Define categories for the estimate
	categories: [
		{
			id: "labor",
			name: "Labor",
			icon: Clock,
			shortName: "Labor",
		},
		{
			id: "materials",
			name: "Materials",
			icon: Package,
			shortName: "Materials",
		},
	],

	// Function to generate default line items based on the hourly rate
	defaultLineItems: (hourlyRate: number): EnhancedLineItem[] => {
		return [
			// Labor items
			{
				id: crypto.randomUUID(),
				name: "Remove old water heater",
				description: "Labor to remove and dispose of old water heater",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 1,
				price: hourlyRate,
				totalPrice: hourlyRate,
			},
			{
				id: crypto.randomUUID(),
				name: "Install tankless water heater",
				description: "Labor to mount and install new tankless unit",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 3.5,
				price: hourlyRate,
				totalPrice: hourlyRate * 3.5,
			},
			{
				id: crypto.randomUUID(),
				name: "Water Line Connections",
				description: "Labor to connect water lines",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 1.5,
				price: hourlyRate,
				totalPrice: hourlyRate * 1.5,
			},
			{
				id: crypto.randomUUID(),
				name: "Gas Line Installation",
				description: "Labor to install/modify gas line for tankless unit",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 2,
				price: hourlyRate,
				totalPrice: hourlyRate * 2,
			},
			{
				id: crypto.randomUUID(),
				name: "Venting Installation",
				description: "Labor to install proper venting for tankless unit",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 2,
				price: hourlyRate,
				totalPrice: hourlyRate * 2,
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Hookup",
				description: "Labor to connect electrical components",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 1,
				price: hourlyRate,
				totalPrice: hourlyRate,
			},
			{
				id: crypto.randomUUID(),
				name: "Test and inspect installation",
				description: "Labor to test all connections and verify proper operation",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 1,
				price: hourlyRate,
				totalPrice: hourlyRate,
			},

			// Materials items
			{
				id: crypto.randomUUID(),
				name: "Tankless Water Heater Unit",
				description: "High-efficiency tankless water heater",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 0,
				price: 1200,
				totalPrice: 1200, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Stainless Steel Venting Kit",
				description: "Proper venting components for tankless unit",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 5,
				price: 250,
				totalPrice: 250, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Gas Line Materials",
				description: "Fittings, pipe, and connectors for gas line",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 10,
				price: 120,
				totalPrice: 120, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Water Line Connectors",
				description: "Braided stainless steel connectors and valves",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 5,
				price: 75,
				totalPrice: 75, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Electrical Components",
				description: "Wire, circuit breaker, and electrical supplies",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 10,
				price: 85,
				totalPrice: 85, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Mounting Hardware",
				description: "Brackets and fasteners for secure installation",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 15,
				price: 45,
				totalPrice: 45, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Permit Fee",
				description: "Local permitting fees",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 0,
				price: 120,
				totalPrice: 120, // Will be calculated with markup in the component
			},
		];
	},
};

export default TanklessWaterHeaterConfig;
