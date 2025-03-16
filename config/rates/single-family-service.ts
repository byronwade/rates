import type { RateCalculatorConfig } from "./index";

const config: RateCalculatorConfig = {
	id: "single-family-service",
	name: "Single Family Service",
	description: "Hourly rate configuration for single family home services",
	category: "single-family",
	serviceType: "single-family",

	// Basic rate parameters
	wastagePercent: 30,
	desiredMargin: 35,
	commissionEnabled: false,

	// Work hour configuration
	dailyWorkHours: 8,
	dailyBillableHours: 5,
	monthlyBillableHours: 160,

	// Crew configuration
	defaultCrewCount: 1,
	defaultCrews: [
		{
			name: "Home Service Crew",
			workers: [
				{
					title: "Service Technician",
					hourlyRate: 30,
					commission: 12,
				},
				{
					title: "Assistant",
					hourlyRate: 20,
					commission: 5,
				},
			],
		},
	],

	// Office staff configuration
	defaultOfficeStaff: [
		{
			title: "Service Coordinator",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 4000,
		},
		{
			title: "Customer Service Rep",
			payType: "hourly",
			hourlyRate: 19,
			monthlySalary: 0,
		},
	],

	// Overhead configuration
	defaultOverheadCosts: [
		{ name: "Office Rent", monthlyCost: 1200 },
		{ name: "Utilities", monthlyCost: 400 },
		{ name: "Insurance", monthlyCost: 750 },
		{ name: "Vehicle Expenses", monthlyCost: 950 },
		{ name: "Tools & Supplies", monthlyCost: 600 },
		{ name: "Software Subscriptions", monthlyCost: 300 },
	],

	// UI defaults
	showComparisons: true,
	showExplanation: true,
	showOfficeStaffSection: true,
	showOverheadSection: true,
};

export default config;
