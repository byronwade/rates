"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HourlyRateCalculator from "./hourly-rate-calculator";
import { Building2, Home, Warehouse } from "lucide-react";
import type { Worker, OverheadCost, OfficeStaff } from "./hourly-rate-calculator";

export type ServiceType = "residential" | "property-management" | "single-family" | "commercial" | "septic";

// Crew interface
export interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

// Default values for each service type
const defaultValues = {
	residential: {
		wastagePercent: 25,
		desiredMargin: 30,
		commissionEnabled: false,
	},
	"property-management": {
		wastagePercent: 20,
		desiredMargin: 25,
		commissionEnabled: false,
	},
	"single-family": {
		wastagePercent: 30,
		desiredMargin: 35,
		commissionEnabled: false,
	},
	commercial: {
		wastagePercent: 15,
		desiredMargin: 40,
		commissionEnabled: false,
	},
	septic: {
		wastagePercent: 30,
		desiredMargin: 35,
		commissionEnabled: false,
	},
};

// Interface for calculator state
interface CalculatorState {
	rateName: string;
	wastagePercent: number;
	crews: Crew[];
	selectedCrewId: string;
	officeStaff?: OfficeStaff[];
	desiredMargin: number;
	commissionEnabled: boolean;
	overheadCosts: OverheadCost[];
	monthlyBillableHours: number;
	dailyWorkHours: number;
	dailyBillableHours: number;
	totalCrews: number;
	showOverheadSection: boolean;
	showOfficeStaffSection?: boolean;
	showComparisons: boolean;
	showExplanation: boolean;
}

// Create default crew with 2 workers
const createDefaultCrew = (index: number): Crew => ({
	id: crypto.randomUUID(),
	name: `Crew ${index}`,
	workers: [
		{ id: crypto.randomUUID(), rate: 25, commission: 10 },
		{ id: crypto.randomUUID(), rate: 25, commission: 10 },
	],
});

// Initial state for each calculator
const getInitialState = (serviceType: ServiceType): CalculatorState => {
	const defaultCrewCount = serviceType === "residential" ? 2 : serviceType === "property-management" ? 2 : serviceType === "single-family" ? 1 : serviceType === "septic" ? 1 : 1;

	// Create default crews
	const crews: Crew[] = [];
	for (let i = 1; i <= defaultCrewCount; i++) {
		crews.push(createDefaultCrew(i));
	}

	return {
		rateName: "",
		wastagePercent: defaultValues[serviceType].wastagePercent,
		crews: crews,
		selectedCrewId: crews[0].id,
		officeStaff: [
			{
				id: "1",
				title: "Office Manager",
				payType: "salary",
				hourlyRate: 25,
				monthlySalary: 4500,
			},
			{
				id: "2",
				title: "Admin Assistant",
				payType: "hourly",
				hourlyRate: 18,
				monthlySalary: 3200,
			},
		],
		desiredMargin: defaultValues[serviceType].desiredMargin,
		commissionEnabled: defaultValues[serviceType].commissionEnabled,
		overheadCosts: [
			{ id: "1", name: "Office Rent", monthlyCost: 1500 },
			{ id: "2", name: "Utilities", monthlyCost: 500 },
			{ id: "3", name: "Insurance", monthlyCost: 300 },
		],
		monthlyBillableHours: 160,
		dailyWorkHours: 8,
		dailyBillableHours: 5,
		totalCrews: defaultCrewCount,
		showOverheadSection: false,
		showOfficeStaffSection: false,
		showComparisons: false,
		showExplanation: false,
	};
};

export default function RateCalculators() {
	const [activeTab, setActiveTab] = useState<ServiceType>("residential");

	// Create state for each calculator type
	const [residentialState, setResidentialState] = useState<CalculatorState>(getInitialState("residential"));
	const [propertyManagementState, setPropertyManagementState] = useState<CalculatorState>(getInitialState("property-management"));
	const [singleFamilyState, setSingleFamilyState] = useState<CalculatorState>(getInitialState("single-family"));
	const [commercialState, setCommercialState] = useState<CalculatorState>(getInitialState("commercial"));

	// Get the current state and setter based on active tab
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getStateAndSetter = (tab: ServiceType): [CalculatorState, React.Dispatch<React.SetStateAction<CalculatorState>>] => {
		switch (tab) {
			case "residential":
				return [residentialState, setResidentialState];
			case "property-management":
				return [propertyManagementState, setPropertyManagementState];
			case "single-family":
				return [singleFamilyState, setSingleFamilyState];
			case "commercial":
				return [commercialState, setCommercialState];
			default:
				return [residentialState, setResidentialState];
		}
	};

	// Load saved state from localStorage on initial load
	useEffect(() => {
		const loadSavedState = (serviceType: ServiceType) => {
			const savedState = localStorage.getItem(`calculator-state-${serviceType}`);
			if (savedState) {
				try {
					const parsedState = JSON.parse(savedState);
					switch (serviceType) {
						case "residential":
							setResidentialState(parsedState);
							break;
						case "property-management":
							setPropertyManagementState(parsedState);
							break;
						case "single-family":
							setSingleFamilyState(parsedState);
							break;
						case "commercial":
							setCommercialState(parsedState);
							break;
					}
				} catch (error) {
					console.error(`Error loading saved state for ${serviceType}:`, error);
				}
			}
		};

		loadSavedState("residential");
		loadSavedState("property-management");
		loadSavedState("single-family");
		loadSavedState("commercial");
	}, []);

	// Save state to localStorage when tab changes
	useEffect(() => {
		const [currentState] = getStateAndSetter(activeTab);
		localStorage.setItem(`calculator-state-${activeTab}`, JSON.stringify(currentState));
	}, [activeTab, residentialState, propertyManagementState, singleFamilyState, commercialState, getStateAndSetter]);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Hourly Rate Calculators</CardTitle>
					<CardDescription>Calculate base hourly rates for different service types to use in future estimates</CardDescription>
				</CardHeader>
			</Card>

			<Tabs defaultValue="residential" value={activeTab} onValueChange={(value) => setActiveTab(value as ServiceType)} className="space-y-6">
				<TabsList className="grid grid-cols-4 mb-8">
					<TabsTrigger value="residential" className="flex items-center gap-2">
						<Home className="h-4 w-4" />
						<span className="hidden sm:inline">Residential</span>
						<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{residentialState.crews.length} crews</span>
					</TabsTrigger>
					<TabsTrigger value="property-management" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						<span className="hidden sm:inline">Property Management</span>
						<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{propertyManagementState.crews.length} crews</span>
					</TabsTrigger>
					<TabsTrigger value="single-family" className="flex items-center gap-2">
						<Home className="h-4 w-4" />
						<span className="hidden sm:inline">Single Family</span>
						<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{singleFamilyState.crews.length} crews</span>
					</TabsTrigger>
					<TabsTrigger value="commercial" className="flex items-center gap-2">
						<Warehouse className="h-4 w-4" />
						<span className="hidden sm:inline">Commercial</span>
						<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{commercialState.crews.length} crews</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="residential">
					<HourlyRateCalculator serviceType="residential" defaultValues={defaultValues.residential} title="Residential Services Rate Calculator" description="Calculate hourly rates for residential service jobs" icon={<Home className="h-5 w-5" />} state={residentialState} setState={setResidentialState} />
				</TabsContent>

				<TabsContent value="property-management">
					<HourlyRateCalculator serviceType="property-management" defaultValues={defaultValues["property-management"]} title="Property Management Rate Calculator" description="Calculate hourly rates for property management service jobs" icon={<Building2 className="h-5 w-5" />} state={propertyManagementState} setState={setPropertyManagementState} />
				</TabsContent>

				<TabsContent value="single-family">
					<HourlyRateCalculator serviceType="single-family" defaultValues={defaultValues["single-family"]} title="Single Family Home Rate Calculator" description="Calculate hourly rates for single family home service jobs" icon={<Home className="h-5 w-5" />} state={singleFamilyState} setState={setSingleFamilyState} />
				</TabsContent>

				<TabsContent value="commercial">
					<HourlyRateCalculator serviceType="commercial" defaultValues={defaultValues.commercial} title="Commercial Services Rate Calculator" description="Calculate hourly rates for commercial service jobs" icon={<Warehouse className="h-5 w-5" />} state={commercialState} setState={setCommercialState} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
