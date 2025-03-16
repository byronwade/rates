"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HourlyRateCalculator from "./hourly-rate-calculator";
import { Building2, Home, Warehouse, ReceiptText } from "lucide-react";
import type { Worker, OverheadCost, OfficeStaff } from "./hourly-rate-calculator";
import { getRateConfig } from "@/config/rates";
import type { WorkerConfig } from "@/config/rates";

export type ServiceType = "residential" | "property-management" | "single-family" | "commercial" | "septic";

// Crew interface
export interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

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

// Map configuration worker to app worker
const mapConfigWorkerToWorker = (configWorker: WorkerConfig): Worker => ({
	id: crypto.randomUUID(),
	rate: configWorker.hourlyRate,
	commission: configWorker.commission,
});

// Map configuration crew to app crew
const mapConfigCrewToCrew = (configCrew: { name: string; workers: WorkerConfig[] }): Crew => ({
	id: crypto.randomUUID(),
	name: configCrew.name,
	workers: configCrew.workers.map(mapConfigWorkerToWorker),
});

// Create state from rate configuration
const createStateFromConfig = async (rateId: string, serviceType: ServiceType): Promise<CalculatorState> => {
	// Load the configuration for this rate
	const config = await getRateConfig(rateId);

	// If config couldn't be loaded, use basic defaults
	if (!config) {
		return getBasicDefaultState(serviceType);
	}

	// Map config crews to app crews format
	const crews = config.defaultCrews.map(mapConfigCrewToCrew);

	// Map overhead costs
	const overheadCosts = config.defaultOverheadCosts.map((cost) => ({
		id: crypto.randomUUID(),
		name: cost.name,
		monthlyCost: cost.monthlyCost,
	}));

	// Map office staff
	const officeStaff = config.defaultOfficeStaff.map((staff) => ({
		id: crypto.randomUUID(),
		title: staff.title,
		payType: staff.payType,
		hourlyRate: staff.hourlyRate,
		monthlySalary: staff.monthlySalary,
	}));

	return {
		rateName: config.name,
		wastagePercent: config.wastagePercent,
		crews: crews,
		selectedCrewId: crews.length > 0 ? crews[0].id : "",
		officeStaff: officeStaff,
		desiredMargin: config.desiredMargin,
		commissionEnabled: config.commissionEnabled,
		overheadCosts: overheadCosts,
		monthlyBillableHours: config.monthlyBillableHours ?? config.dailyBillableHours * 22,
		dailyWorkHours: config.dailyWorkHours,
		dailyBillableHours: config.dailyBillableHours,
		totalCrews: config.defaultCrewCount,
		showOverheadSection: config.showOverheadSection || false,
		showOfficeStaffSection: config.showOfficeStaffSection || false,
		showComparisons: config.showComparisons || false,
		showExplanation: config.showExplanation || false,
	};
};

// Create default crew with 2 workers (fallback)
const createDefaultCrew = (index: number): Crew => ({
	id: crypto.randomUUID(),
	name: `Crew ${index}`,
	workers: [
		{ id: crypto.randomUUID(), rate: 25, commission: 10 },
		{ id: crypto.randomUUID(), rate: 25, commission: 10 },
	],
});

// Basic default state as fallback if configs can't be loaded
const getBasicDefaultState = (serviceType: ServiceType): CalculatorState => {
	// Default values for various service types as fallback
	const basicDefaults = {
		residential: {
			wastagePercent: 25,
			desiredMargin: 30,
			commissionEnabled: false,
			defaultCrewCount: 2,
		},
		"property-management": {
			wastagePercent: 20,
			desiredMargin: 25,
			commissionEnabled: false,
			defaultCrewCount: 2,
		},
		"single-family": {
			wastagePercent: 30,
			desiredMargin: 35,
			commissionEnabled: false,
			defaultCrewCount: 1,
		},
		commercial: {
			wastagePercent: 15,
			desiredMargin: 40,
			commissionEnabled: false,
			defaultCrewCount: 1,
		},
		septic: {
			wastagePercent: 30,
			desiredMargin: 35,
			commissionEnabled: false,
			defaultCrewCount: 1,
		},
	};

	const defaultCrewCount = basicDefaults[serviceType].defaultCrewCount;

	// Create default crews
	const crews: Crew[] = [];
	for (let i = 1; i <= defaultCrewCount; i++) {
		crews.push(createDefaultCrew(i));
	}

	return {
		rateName: "",
		wastagePercent: basicDefaults[serviceType].wastagePercent,
		crews: crews,
		selectedCrewId: crews[0].id,
		officeStaff: [
			{
				id: crypto.randomUUID(),
				title: "Office Manager",
				payType: "salary",
				hourlyRate: 25,
				monthlySalary: 4500,
			},
			{
				id: crypto.randomUUID(),
				title: "Admin Assistant",
				payType: "hourly",
				hourlyRate: 18,
				monthlySalary: 3200,
			},
		],
		desiredMargin: basicDefaults[serviceType].desiredMargin,
		commissionEnabled: basicDefaults[serviceType].commissionEnabled,
		overheadCosts: [
			{ id: crypto.randomUUID(), name: "Office Rent", monthlyCost: 1500 },
			{ id: crypto.randomUUID(), name: "Utilities", monthlyCost: 500 },
			{ id: crypto.randomUUID(), name: "Insurance", monthlyCost: 300 },
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

// Get appropriate icon for each service type
const getServiceIcon = (serviceType: ServiceType) => {
	switch (serviceType) {
		case "residential":
			return <Home className="h-5 w-5" />;
		case "commercial":
			return <Warehouse className="h-5 w-5" />;
		case "property-management":
			return <Building2 className="h-5 w-5" />;
		case "septic":
			return <ReceiptText className="h-5 w-5" />;
		case "single-family":
			return <Home className="h-5 w-5" />;
		default:
			return <Home className="h-5 w-5" />;
	}
};

export default function RateCalculators() {
	const [activeTab, setActiveTab] = useState<ServiceType>("residential");
	const [loading, setLoading] = useState(true);

	// Create state for each calculator type
	const [residentialState, setResidentialState] = useState<CalculatorState | null>(null);
	const [propertyManagementState, setPropertyManagementState] = useState<CalculatorState | null>(null);
	const [singleFamilyState, setSingleFamilyState] = useState<CalculatorState | null>(null);
	const [commercialState, setCommercialState] = useState<CalculatorState | null>(null);
	const [septicState, setSepticState] = useState<CalculatorState | null>(null);

	// Initialize calculator states from configurations
	useEffect(() => {
		const loadConfigurations = async () => {
			setLoading(true);
			try {
				// Load configurations for each service type
				const residentialConfig = await createStateFromConfig("residential-plumbing", "residential");
				setResidentialState(residentialConfig);

				const propertyManagementConfig = await createStateFromConfig("property-management", "property-management");
				setPropertyManagementState(propertyManagementConfig);

				const singleFamilyConfig = await createStateFromConfig("single-family-service", "single-family");
				setSingleFamilyState(singleFamilyConfig);

				const commercialConfig = await createStateFromConfig("commercial-plumbing", "commercial");
				setCommercialState(commercialConfig);

				const septicConfig = await createStateFromConfig("septic-service", "septic");
				setSepticState(septicConfig);
			} catch (error) {
				console.error("Error loading rate configurations:", error);
				// Fall back to basic defaults
				setResidentialState(getBasicDefaultState("residential"));
				setPropertyManagementState(getBasicDefaultState("property-management"));
				setSingleFamilyState(getBasicDefaultState("single-family"));
				setCommercialState(getBasicDefaultState("commercial"));
				setSepticState(getBasicDefaultState("septic"));
			} finally {
				setLoading(false);
			}
		};

		loadConfigurations();
	}, []);

	return (
		<div className="space-y-6">
			{loading ? (
				<Card>
					<CardHeader>
						<CardTitle className="animate-pulse">Loading Rate Calculators...</CardTitle>
						<CardDescription className="animate-pulse">Please wait while configurations load</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Hourly Rate Calculators</CardTitle>
							<CardDescription>Calculate base hourly rates for different service types to use in future estimates</CardDescription>
						</CardHeader>
					</Card>

					<Tabs defaultValue="residential" value={activeTab} onValueChange={(value) => setActiveTab(value as ServiceType)} className="space-y-6">
						<TabsList className="grid grid-cols-5 mb-8">
							<TabsTrigger value="residential" className="flex items-center gap-2">
								<Home className="h-4 w-4" />
								<span className="hidden sm:inline">Residential</span>
								<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{residentialState?.crews.length || 0} crews</span>
							</TabsTrigger>
							<TabsTrigger value="property-management" className="flex items-center gap-2">
								<Building2 className="h-4 w-4" />
								<span className="hidden sm:inline">Property Management</span>
								<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{propertyManagementState?.crews.length || 0} crews</span>
							</TabsTrigger>
							<TabsTrigger value="single-family" className="flex items-center gap-2">
								<Home className="h-4 w-4" />
								<span className="hidden sm:inline">Single Family</span>
								<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{singleFamilyState?.crews.length || 0} crews</span>
							</TabsTrigger>
							<TabsTrigger value="commercial" className="flex items-center gap-2">
								<Warehouse className="h-4 w-4" />
								<span className="hidden sm:inline">Commercial</span>
								<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{commercialState?.crews.length || 0} crews</span>
							</TabsTrigger>
							<TabsTrigger value="septic" className="flex items-center gap-2">
								<ReceiptText className="h-4 w-4" />
								<span className="hidden sm:inline">Septic</span>
								<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{septicState?.crews.length || 0} crews</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="residential">
							{residentialState && (
								<HourlyRateCalculator
									serviceType="residential"
									defaultValues={{
										wastagePercent: residentialState.wastagePercent,
										desiredMargin: residentialState.desiredMargin,
										commissionEnabled: residentialState.commissionEnabled,
									}}
									title="Residential Services Rate Calculator"
									description="Calculate hourly rates for residential service jobs"
									icon={getServiceIcon("residential")}
									state={residentialState}
									setState={setResidentialState as React.Dispatch<React.SetStateAction<CalculatorState>>}
								/>
							)}
						</TabsContent>

						<TabsContent value="property-management">
							{propertyManagementState && (
								<HourlyRateCalculator
									serviceType="property-management"
									defaultValues={{
										wastagePercent: propertyManagementState.wastagePercent,
										desiredMargin: propertyManagementState.desiredMargin,
										commissionEnabled: propertyManagementState.commissionEnabled,
									}}
									title="Property Management Rate Calculator"
									description="Calculate hourly rates for property management service jobs"
									icon={getServiceIcon("property-management")}
									state={propertyManagementState}
									setState={setPropertyManagementState as React.Dispatch<React.SetStateAction<CalculatorState>>}
								/>
							)}
						</TabsContent>

						<TabsContent value="single-family">
							{singleFamilyState && (
								<HourlyRateCalculator
									serviceType="single-family"
									defaultValues={{
										wastagePercent: singleFamilyState.wastagePercent,
										desiredMargin: singleFamilyState.desiredMargin,
										commissionEnabled: singleFamilyState.commissionEnabled,
									}}
									title="Single Family Home Rate Calculator"
									description="Calculate hourly rates for single family home service jobs"
									icon={getServiceIcon("single-family")}
									state={singleFamilyState}
									setState={setSingleFamilyState as React.Dispatch<React.SetStateAction<CalculatorState>>}
								/>
							)}
						</TabsContent>

						<TabsContent value="commercial">
							{commercialState && (
								<HourlyRateCalculator
									serviceType="commercial"
									defaultValues={{
										wastagePercent: commercialState.wastagePercent,
										desiredMargin: commercialState.desiredMargin,
										commissionEnabled: commercialState.commissionEnabled,
									}}
									title="Commercial Services Rate Calculator"
									description="Calculate hourly rates for commercial service jobs"
									icon={getServiceIcon("commercial")}
									state={commercialState}
									setState={setCommercialState as React.Dispatch<React.SetStateAction<CalculatorState>>}
								/>
							)}
						</TabsContent>

						<TabsContent value="septic">
							{septicState && (
								<HourlyRateCalculator
									serviceType="septic"
									defaultValues={{
										wastagePercent: septicState.wastagePercent,
										desiredMargin: septicState.desiredMargin,
										commissionEnabled: septicState.commissionEnabled,
									}}
									title="Septic Services Rate Calculator"
									description="Calculate hourly rates for septic installation and service"
									icon={getServiceIcon("septic")}
									state={septicState}
									setState={setSepticState as React.Dispatch<React.SetStateAction<CalculatorState>>}
								/>
							)}
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
}
