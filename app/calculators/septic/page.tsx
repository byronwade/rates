"use client";

import { useState, useEffect } from "react";
import { SubNavBar } from "@/components/ui/nav-bar";
import HourlyRateCalculator from "@/components/hourly-rate-calculator";
import { Home, Building2, Warehouse, ReceiptText } from "lucide-react";
import type { CalculatorState } from "@/types";

// Define default values for septic
const defaultValues = {
	wastagePercent: 30,
	desiredMargin: 35,
	commissionEnabled: false,
};

export default function SepticCalculatorPage() {
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

	// Create initial state for septic services
	const initialState: CalculatorState = {
		rateName: "Septic Service Rate",
		wastagePercent: defaultValues.wastagePercent,
		crews: [
			{
				id: crypto.randomUUID(),
				name: "Crew 1",
				workers: [
					{ id: crypto.randomUUID(), rate: 25, commission: 10 },
					{ id: crypto.randomUUID(), rate: 28, commission: 10 },
				],
			},
		],
		selectedCrewId: "",
		officeStaff: [
			{
				id: "1",
				title: "Office Manager",
				payType: "salary" as const,
				hourlyRate: 25,
				monthlySalary: 4500,
			},
			{
				id: "2",
				title: "Admin Assistant",
				payType: "hourly" as const,
				hourlyRate: 18,
				monthlySalary: 3200,
			},
		],
		desiredMargin: defaultValues.desiredMargin,
		commissionEnabled: defaultValues.commissionEnabled,
		overheadCosts: [
			{ id: "1", name: "Office Rent", monthlyCost: 1500 },
			{ id: "2", name: "Utilities", monthlyCost: 500 },
			{ id: "3", name: "Insurance", monthlyCost: 450 },
			{ id: "4", name: "Vehicle Expenses", monthlyCost: 2800 },
			{ id: "5", name: "Specialized Equipment", monthlyCost: 1200 },
			{ id: "6", name: "Marketing", monthlyCost: 1000 },
			{ id: "7", name: "Software & Technology", monthlyCost: 600 },
			{ id: "8", name: "Permitting & Compliance", monthlyCost: 800 },
		],
		monthlyBillableHours: 160,
		dailyWorkHours: 8,
		dailyBillableHours: 5.5,
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
		const savedState = localStorage.getItem("calculator-state-septic");
		if (savedState) {
			try {
				setState(JSON.parse(savedState));
			} catch (error) {
				console.error("Error loading saved septic calculator state:", error);
			}
		}
	}, []);

	// Save state to localStorage when it changes
	useEffect(() => {
		if (Object.keys(state).length > 0) {
			localStorage.setItem("calculator-state-septic", JSON.stringify(state));
		}
	}, [state]);

	return (
		<>
			<SubNavBar links={calculatorLinks} />

			<div className="py-6">
				<h1 className="text-3xl font-bold mb-6">Septic Service Rate Calculator</h1>

				<div className="container mx-auto">
					<HourlyRateCalculator serviceType="septic" defaultValues={defaultValues} title="Septic Services Rate Calculator" description="Calculate hourly rates for septic installation, maintenance, and repair" icon={<ReceiptText className="h-5 w-5" />} state={state} setState={setState} />
				</div>
			</div>
		</>
	);
}
