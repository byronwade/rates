import type { RateCalculatorConfig } from "./index";

const config: RateCalculatorConfig = {
	id: "property-management",
	name: "Property Management",
	description: "Hourly rate configuration for property management services",
	category: "property-management",
	serviceType: "property-management",

	// Basic rate parameters
	wastagePercent: 20,
	desiredMargin: 25,
	commissionEnabled: false,

	// Work hour configuration
	dailyWorkHours: 8,
	dailyBillableHours: 5.5,
	monthlyBillableHours: 176,

	// Crew configuration
	defaultCrewCount: 2,
	defaultCrews: [
		{
			name: "Property Crew A",
			workers: [
				{
					title: "Maintenance Tech",
					hourlyRate: 28,
					commission: 10,
				},
				{
					title: "Helper",
					hourlyRate: 18,
					commission: 5,
				},
			],
		},
		{
			name: "Property Crew B",
			workers: [
				{
					title: "Maintenance Tech",
					hourlyRate: 26,
					commission: 10,
				},
				{
					title: "Helper",
					hourlyRate: 17,
					commission: 5,
				},
			],
		},
	],

	// Office staff configuration
	defaultOfficeStaff: [
		{
			title: "Property Manager",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 5200,
		},
		{
			title: "Dispatcher",
			payType: "hourly",
			hourlyRate: 20,
			monthlySalary: 0,
		},
	],

	// Overhead configuration
	defaultOverheadCosts: [
		{ name: "Office Space", monthlyCost: 1200 },
		{ name: "Utilities", monthlyCost: 450 },
		{ name: "Insurance", monthlyCost: 750 },
		{ name: "Vehicle Expenses", monthlyCost: 1100 },
		{ name: "Tools & Supplies", monthlyCost: 800 },
	],

	// UI defaults
	showComparisons: true,
	showExplanation: false,
	showOfficeStaffSection: true,
	showOverheadSection: true,
};

export default config;
