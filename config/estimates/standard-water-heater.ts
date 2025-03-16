import { EstimateTemplateConfig, EnhancedLineItem } from "@/components/estimates/template-engine";
import { Clock, Package, Droplets } from "lucide-react";

// Template configuration for Standard Water Heater Replacement
const StandardWaterHeaterConfig: EstimateTemplateConfig = {
	id: "standard-water-heater",
	name: "Standard Water Heater Replacement",
	icon: Droplets, // Using Droplets as the primary icon
	description: "Estimate template for replacing a standard tank water heater.",
	defaultProjectName: "Standard Water Heater Installation",
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
				name: "Install new water heater",
				description: "Labor to install new standard water heater",
				type: "labor",
				category: "labor",
				quantity: 1,
				hours: 2.5,
				price: hourlyRate,
				totalPrice: hourlyRate * 2.5,
			},
			{
				id: crypto.randomUUID(),
				name: "Water Line Connections",
				description: "Labor to connect water lines",
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
				hours: 0.5,
				price: hourlyRate,
				totalPrice: hourlyRate * 0.5,
			},

			// Materials items
			{
				id: crypto.randomUUID(),
				name: "40-gallon standard water heater",
				description: "Standard tank water heater unit",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 0,
				price: 650,
				totalPrice: 650, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Water Heater Expansion Tank",
				description: "Required expansion tank",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 0,
				price: 45,
				totalPrice: 45, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Flexible Water Connectors",
				description: "Braided stainless steel connectors",
				type: "material",
				category: "materials",
				quantity: 2,
				wastage: 0,
				price: 15,
				totalPrice: 30, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "T&P Relief Valve & Discharge Pipe",
				description: "Temperature & pressure relief valve with pipe",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 0,
				price: 35,
				totalPrice: 35, // Will be calculated with markup in the component
			},
			{
				id: crypto.randomUUID(),
				name: "Miscellaneous Fittings",
				description: "Various plumbing fittings and connectors",
				type: "material",
				category: "materials",
				quantity: 1,
				wastage: 10,
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
				price: 90,
				totalPrice: 90, // Will be calculated with markup in the component
			},
		];
	},
};

export default StandardWaterHeaterConfig;
