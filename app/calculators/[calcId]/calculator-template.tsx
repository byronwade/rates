"use client";

import { Suspense, useEffect, useState } from "react";
import { TemplatePageLayout } from "@/components/layout/template-page-layout";
import HourlyRateCalculator from "@/components/hourly-rate-calculator";
import { ServiceType } from "@/components/rate-calculators";
import { Home, Building2, Warehouse, ReceiptText, RefreshCw } from "lucide-react";
import type { RateCalculatorConfig } from "@/config/rates";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Map to convert service type to appropriate icon
const serviceIconMap: Record<ServiceType, React.ReactNode> = {
	residential: <Home className="h-5 w-5" />,
	commercial: <Warehouse className="h-5 w-5" />,
	"property-management": <Building2 className="h-5 w-5" />,
	septic: <ReceiptText className="h-5 w-5" />,
	"single-family": <Home className="h-5 w-5" />,
};

// Enhanced calculator state type
interface CalculatorState {
	rateName: string;
	wastagePercent: number;
	crews: {
		id: string;
		name: string;
		workers: {
			id: string;
			rate: number;
			commission: number;
		}[];
	}[];
	selectedCrewId: string;
	officeStaff?: {
		id: string;
		title: string;
		payType: "hourly" | "salary";
		hourlyRate: number;
		monthlySalary: number;
	}[];
	desiredMargin: number;
	commissionEnabled: boolean;
	overheadCosts: {
		id: string;
		name: string;
		monthlyCost: number;
	}[];
	monthlyBillableHours: number;
	dailyWorkHours: number;
	dailyBillableHours: number;
	totalCrews: number;
	showOverheadSection: boolean;
	showOfficeStaffSection?: boolean;
	showComparisons: boolean;
	showExplanation: boolean;
}

// Interface for enhanced configuration from server
interface EnhancedCalculatorConfig extends RateCalculatorConfig {
	serviceType: ServiceType;
	isSerializedConfig: boolean;
}

interface CalculatorTemplateProps {
	calcId: string;
	serviceType: ServiceType;
	preloadedConfig: string;
}

export default function CalculatorTemplate({ calcId, serviceType, preloadedConfig }: CalculatorTemplateProps) {
	// Parse the preloaded config
	const [config, setConfig] = useState<EnhancedCalculatorConfig | null>(null);
	const [state, setState] = useState<CalculatorState | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Function to force refresh the template
	const refreshTemplate = () => {
		setIsRefreshing(true);

		// Remove saved state to force using fresh config
		localStorage.removeItem(`calculator-state-${calcId}`);

		// Use window.location for a hard refresh to ensure
		// the entire page is reloaded with fresh data
		window.location.href = `/calculators/${calcId}?refresh=true&t=${Date.now()}`;

		// The page will reload, but just in case add a timeout to reset
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	};

	// Save state to localStorage when it changes
	useEffect(() => {
		if (state && config) {
			localStorage.setItem(`calculator-state-${calcId}`, JSON.stringify(state));
		}
	}, [state, calcId, config]);

	useEffect(() => {
		try {
			// Parse the JSON string back to an object
			const parsedConfig = JSON.parse(preloadedConfig) as EnhancedCalculatorConfig;
			setConfig(parsedConfig);
			console.log("Loaded config:", parsedConfig);

			// Try to load saved state from localStorage first
			const savedState = localStorage.getItem(`calculator-state-${calcId}`);
			if (savedState) {
				try {
					console.log("Found saved state in localStorage");
					const parsedState = JSON.parse(savedState) as CalculatorState;

					// Create fresh crews from config
					const freshCrews = parsedConfig.defaultCrews.map((crew) => ({
						id: crypto.randomUUID(),
						name: crew.name,
						workers: crew.workers.map((worker) => ({
							id: crypto.randomUUID(),
							rate: worker.hourlyRate,
							commission: worker.commission,
						})),
					}));

					// Create fresh office staff from config
					const freshOfficeStaff = parsedConfig.defaultOfficeStaff.map((staff) => ({
						id: crypto.randomUUID(),
						title: staff.title,
						payType: staff.payType,
						hourlyRate: staff.hourlyRate,
						monthlySalary: staff.monthlySalary,
					}));

					// Create fresh overhead costs from config
					const freshOverheadCosts = parsedConfig.defaultOverheadCosts.map((cost) => ({
						id: crypto.randomUUID(),
						name: cost.name,
						monthlyCost: cost.monthlyCost,
					}));

					// Create a fully refreshed state that prioritizes config values
					const refreshedState: CalculatorState = {
						...parsedState,
						// Use current name from saved state, but all other values from fresh config
						rateName: parsedState.rateName || parsedConfig.name,
						wastagePercent: parsedConfig.wastagePercent,
						desiredMargin: parsedConfig.desiredMargin,
						commissionEnabled: parsedConfig.commissionEnabled,
						dailyWorkHours: parsedConfig.dailyWorkHours,
						dailyBillableHours: parsedConfig.dailyBillableHours,
						monthlyBillableHours: parsedConfig.monthlyBillableHours || 160,
						totalCrews: parsedConfig.defaultCrewCount,
						// Use fresh crews, office staff, and overhead from config
						crews: freshCrews,
						officeStaff: freshOfficeStaff,
						overheadCosts: freshOverheadCosts,
						// Select first crew by default
						selectedCrewId: freshCrews.length > 0 ? freshCrews[0].id : "",
						// UI settings from config
						showOverheadSection: parsedConfig.showOverheadSection || false,
						showOfficeStaffSection: parsedConfig.showOfficeStaffSection || false,
						showComparisons: parsedConfig.showComparisons || false,
						showExplanation: parsedConfig.showExplanation || false,
					};

					console.log("Using completely refreshed state from config:", refreshedState);
					setState(refreshedState);

					// Also immediately save this refreshed state to localStorage
					localStorage.setItem(`calculator-state-${calcId}`, JSON.stringify(refreshedState));
				} catch (e) {
					console.error("Error parsing saved state, creating new state:", e);
					// Create initial calculator state from the config if saved state can't be used
					const initialState: CalculatorState = createInitialState(parsedConfig);
					setState(initialState);
				}
			} else {
				console.log("No saved state found, creating initial state from config");
				// Create initial calculator state from the config
				const initialState: CalculatorState = createInitialState(parsedConfig);
				setState(initialState);
			}
		} catch (error) {
			console.error("Error parsing preloaded config:", error);
		}
	}, [preloadedConfig, calcId]);

	// Create initial calculator state from configuration
	function createInitialState(config: EnhancedCalculatorConfig): CalculatorState {
		// Create crews from configuration
		const crews = config.defaultCrews.map((crew) => ({
			id: crypto.randomUUID(),
			name: crew.name,
			workers: crew.workers.map((worker) => ({
				id: crypto.randomUUID(),
				rate: worker.hourlyRate,
				commission: worker.commission,
			})),
		}));

		// Create office staff from configuration
		const officeStaff = config.defaultOfficeStaff.map((staff) => ({
			id: crypto.randomUUID(),
			title: staff.title,
			payType: staff.payType,
			hourlyRate: staff.hourlyRate,
			monthlySalary: staff.monthlySalary,
		}));

		// Create overhead costs from configuration
		const overheadCosts = config.defaultOverheadCosts.map((cost) => ({
			id: crypto.randomUUID(),
			name: cost.name,
			monthlyCost: cost.monthlyCost,
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
			monthlyBillableHours: config.monthlyBillableHours || 160,
			dailyWorkHours: config.dailyWorkHours,
			dailyBillableHours: config.dailyBillableHours,
			totalCrews: config.defaultCrewCount,
			showOverheadSection: config.showOverheadSection || false,
			showOfficeStaffSection: config.showOfficeStaffSection || false,
			showComparisons: config.showComparisons || false,
			showExplanation: config.showExplanation || false,
		};
	}

	// Display loading state if not ready
	if (!config || !state) {
		return (
			<TemplatePageLayout>
				<div className="animate-pulse h-screen w-full bg-muted/20"></div>
			</TemplatePageLayout>
		);
	}

	return (
		<TemplatePageLayout>
			<Suspense fallback={<div className="animate-pulse h-screen w-full bg-muted/20"></div>}>
				<div className="w-full">
					{/* Improved header with gradient background */}
					<div className="bg-gradient-to-r from-slate-900 to-blue-800 text-white py-8 px-6 sm:px-8 md:px-10">
						<div className="max-w-screen-2xl mx-auto">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-3">
										{serviceIconMap[serviceType]}
										<div className="uppercase text-xs font-semibold tracking-wide text-blue-200 bg-blue-900/40 px-2 py-1 rounded">
											{serviceType
												.split("-")
												.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
												.join(" ")}{" "}
											Rate
										</div>
									</div>
									<h1 className="text-3xl sm:text-4xl font-bold mb-2">{config?.name}</h1>
									<p className="text-blue-100 max-w-2xl">{config?.description}</p>
								</div>
								<div className="flex gap-2 self-end md:self-center">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="outline" size="icon" onClick={refreshTemplate} disabled={isRefreshing} className={`bg-white/10 hover:bg-white/20 border-white/20 text-white ${isRefreshing ? "animate-spin" : ""}`}>
													<RefreshCw className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Reset to latest configuration defaults</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>
						</div>
					</div>

					{/* Calculator content with improved padding and max width */}
					<div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-screen-2xl mx-auto">
						{state && config && (
							<HourlyRateCalculator
								serviceType={serviceType}
								defaultValues={{
									wastagePercent: config.wastagePercent,
									desiredMargin: config.desiredMargin,
									commissionEnabled: config.commissionEnabled,
								}}
								title={config.name}
								description={config.description}
								icon={serviceIconMap[serviceType]}
								state={state}
								setState={setState as React.Dispatch<React.SetStateAction<CalculatorState>>}
							/>
						)}
					</div>
				</div>
			</Suspense>
		</TemplatePageLayout>
	);
}
