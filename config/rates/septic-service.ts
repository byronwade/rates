import type { RateCalculatorConfig } from "./index";

const config: RateCalculatorConfig = {
	id: "septic-service",
	name: "Septic Service",
	description: "Hourly rate configuration for septic services",
	category: "septic",
	serviceType: "septic",

	// Basic rate parameters
	wastagePercent: 30,
	desiredMargin: 35,
	commissionEnabled: true,

	// Work hour configuration
	dailyWorkHours: 8,
	dailyBillableHours: 5,
	monthlyBillableHours: 160,

	// Crew configuration
	defaultCrewCount: 1,
	defaultCrews: [
		{
			name: "Septic Service Crew",
			workers: [
				{
					title: "Lead Technician",
					hourlyRate: 42,
					commission: 15,
				},
				{
					title: "Equipment Operator",
					hourlyRate: 38,
					commission: 12,
				},
				{
					title: "Laborer",
					hourlyRate: 25,
					commission: 5,
				},
			],
		},
	],

	// Office staff configuration
	defaultOfficeStaff: [
		{
			title: "Operations Manager",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 5800,
		},
		{
			title: "Permits Specialist",
			payType: "salary",
			hourlyRate: 0,
			monthlySalary: 4200,
		},
		{
			title: "Administrative Assistant",
			payType: "hourly",
			hourlyRate: 20,
			monthlySalary: 0,
		},
	],

	// Overhead configuration
	defaultOverheadCosts: [
		{ name: "Office Space", monthlyCost: 1800 },
		{ name: "Heavy Equipment Leases", monthlyCost: 3500 },
		{ name: "Specialized Tools", monthlyCost: 900 },
		{ name: "Insurance & Bonds", monthlyCost: 2200 },
		{ name: "Vehicle Expenses", monthlyCost: 1800 },
		{ name: "Environmental Compliance", monthlyCost: 600 },
	],

	// UI defaults
	showComparisons: true,
	showExplanation: true,
	showOfficeStaffSection: true,
	showOverheadSection: true,
};

export default config;
