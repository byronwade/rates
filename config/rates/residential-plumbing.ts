import type { RateCalculatorConfig } from "./index";

const config: RateCalculatorConfig = {
	id: "residential-plumbing",
	name: "Residential Plumbing",
	description: "Hourly rate configuration for residential plumbing services",
	category: "residential",
	serviceType: "residential",

	// Basic rate parameters
	wastagePercent: 37.5,
	desiredMargin: 40,
	commissionEnabled: false,

	// Work hour configuration
	dailyWorkHours: 8,
	dailyBillableHours: 4,

	// Crew configuration
	defaultCrewCount: 2,
	defaultCrews: [
		{
			name: "Residential Crew 1",
			workers: [
				{
					title: "Lead Plumber",
					hourlyRate: 40,
					commission: 30,
				},
			],
		},
		{
			name: "Residential Crew 2",
			workers: [
				{
					title: "Lead Plumber",
					hourlyRate: 40,
					commission: 30,
				},
			],
		},
		{
			name: "Residential Crew 3",
			workers: [
				{
					title: "Lead Plumber",
					hourlyRate: 60,
					commission: 30,
				},
			],
		},
	],

	// Office staff configuration
	defaultOfficeStaff: [
		{
			title: "Admin Assistant",
			payType: "hourly",
			hourlyRate: 30,
			monthlySalary: 0,
		},
	],

	// Overhead configuration
	defaultOverheadCosts: [{ name: "All", monthlyCost: 25000 }],

	// UI defaults
	showComparisons: true,
	showExplanation: true,
	showOfficeStaffSection: true,
	showOverheadSection: true,
};

export default config;
