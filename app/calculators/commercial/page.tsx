"use client";

import { useState, useEffect } from "react";
import { SubNavBar } from "@/components/ui/nav-bar";
import HourlyRateCalculator from "@/components/hourly-rate-calculator";
import { Home, Building2, Warehouse, ReceiptText } from "lucide-react";
import type { CalculatorState } from "@/types";

// Define default values for commercial
const defaultValues = {
	wastagePercent: 15,
	desiredMargin: 40,
	commissionEnabled: false,
};

export default function CommercialCalculatorPage() {
	const calculatorLinks = [
		{
			title: "Residential",
			href: "/calculators/residential",
			icon: <Home className="h-4 w-4" />,
		},
		{
			title: "Property Management",
			href: "/calculators/property-management",
			icon: <Building2 className="h-4 w-4" />,
		},
		{
			title: "Single Family",
			href: "/calculators/single-family",
			icon: <Home className="h-4 w-4" />,
		},
		{
			title: "Septic",
			href: "/calculators/septic",
			icon: <ReceiptText className="h-4 w-4" />,
		},
		{
			title: "Commercial",
			href: "/calculators/commercial",
			icon: <Warehouse className="h-4 w-4" />,
		},
	];

	// Create initial state
	const initialState: CalculatorState = {
		rateName: "Commercial Service Rate",
		wastagePercent: defaultValues.wastagePercent,
		crews: [
			{
				id: crypto.randomUUID(),
				name: "Crew 1",
				workers: [
					{ id: crypto.randomUUID(), rate: 32, commission: 15 },
					{ id: crypto.randomUUID(), rate: 32, commission: 15 },
				],
			},
		],
		selectedCrewId: "",
		officeStaff: [
			{
				id: "1",
				title: "Office Manager",
				payType: "salary" as const,
				hourlyRate: 30,
				monthlySalary: 5200,
			},
			{
				id: "2",
				title: "Admin Assistant",
				payType: "hourly" as const,
				hourlyRate: 22,
				monthlySalary: 3800,
			},
		],
		desiredMargin: defaultValues.desiredMargin,
		commissionEnabled: defaultValues.commissionEnabled,
		overheadCosts: [
			{ id: "1", name: "Office Rent", monthlyCost: 2000 },
			{ id: "2", name: "Utilities", monthlyCost: 700 },
			{ id: "3", name: "Insurance", monthlyCost: 500 },
			{ id: "4", name: "Equipment", monthlyCost: 1200 },
		],
		monthlyBillableHours: 180,
		dailyWorkHours: 8,
		dailyBillableHours: 7,
		totalCrews: 1,
		showOverheadSection: false,
		showOfficeStaffSection: false,
		showComparisons: false,
		showExplanation: false,
	};

	// Make sure selectedCrewId is set
	initialState.selectedCrewId = initialState.crews[0].id;

	const [state, setState] = useState<CalculatorState>(initialState);

	// Load saved state from localStorage on mount
	useEffect(() => {
		const savedState = localStorage.getItem("calculator-state-commercial");
		if (savedState) {
			try {
				setState(JSON.parse(savedState));
			} catch (error) {
				console.error("Error loading saved commercial calculator state:", error);
			}
		}
	}, []);

	// Save state to localStorage when it changes
	useEffect(() => {
		if (Object.keys(state).length > 0) {
			localStorage.setItem("calculator-state-commercial", JSON.stringify(state));
		}
	}, [state]);

	return (
		<>
			<SubNavBar links={calculatorLinks} />

			<div className="py-6">
				<h1 className="text-3xl font-bold mb-6">Commercial Rate Calculator</h1>

				<HourlyRateCalculator serviceType="commercial" defaultValues={defaultValues} title="Commercial Services Rate Calculator" description="Calculate hourly rates for commercial service jobs" icon={<Warehouse className="h-5 w-5" />} state={state} setState={setState} />
			</div>
		</>
	);
}
