import type { RateCalculatorConfig } from "./index";

const config: RateCalculatorConfig = {
	id: "commercial-plumbing",
	name: "Commercial Plumbing",
	description: "Hourly rate configuration for commercial plumbing services",
	category: "commercial",
	serviceType: "commercial",

	// Basic rate parameters
	wastagePercent: 15,
	desiredMargin: 40,
	commissionEnabled: true,

	// Work hour configuration
	dailyWorkHours: 8,
	dailyBillableHours: 6, // Commercial has higher billable hours ratio
	monthlyBillableHours: 192,

	// Crew configuration
	defaultCrewCount: 1,
	defaultCrews: [
		{
			name: "Commercial Crew",
			workers: [
				{
					title: "Master Plumber",
					hourlyRate: 45,
					commission: 18,
				},
				{
					title: "Journeyman Plumber",
					hourlyRate: 35,
					commission: 12,
				},
				{
					title: "Apprentice",
					hourlyRate: 25,
					commission: 5,
				},
			],
		},
	],

	// Office staff configuration
	defaultOfficeStaff: [
		{
			title: "Project Manager",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 6000,
		},
		{
			title: "Office Manager",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 4500,
		},
		{
			title: "Admin Assistant",
			payType: "hourly",
			hourlyRate: 22,
			monthlySalary: 0,
		},
	],

	// Overhead configuration
	defaultOverheadCosts: [
		{ name: "Office Rent", monthlyCost: 2500 },
		{ name: "Equipment Leases", monthlyCost: 1800 },
		{ name: "Insurance", monthlyCost: 2000 },
		{ name: "Vehicle Fleet", monthlyCost: 3500 },
		{ name: "Commercial Tools", monthlyCost: 1200 },
		{ name: "Safety Training", monthlyCost: 500 },
	],

	// UI defaults
	showComparisons: true,
	showExplanation: true,
	showOfficeStaffSection: true,
	showOverheadSection: true,
};

export default config;
