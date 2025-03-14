"use client";

import type React from "react";

import { useState, useEffect, type ReactNode, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Calculator, Clock, Plus, Minus, BarChart3, UserCog } from "lucide-react";
import type { ServiceType } from "./rate-calculators";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import RateComparisons from "./rate-comparisons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CrewConfiguration from "./crew-configuration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { v4 as uuidv4 } from "uuid";

export interface Worker {
	id: string;
	rate: number;
	commission: number;
}

export interface OfficeStaff {
	id: string;
	title: string;
	payType: "hourly" | "salary";
	hourlyRate: number;
	monthlySalary: number;
}

export interface OverheadCost {
	id: string;
	name: string;
	monthlyCost: number;
}

export interface HourlyRateCalculatorProps {
	serviceType: ServiceType;
	defaultValues: {
		wastagePercent: number;
		desiredMargin: number;
		commissionEnabled: boolean;
	};
	title: string;
	description: string;
	icon: ReactNode;
	state: CalculatorState;
	setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

// Define CalculatorState type to match the state shape
type CalculatorState = {
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
};

// Add the Crew interface
export interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

export default function HourlyRateCalculator({ serviceType, defaultValues, title, description, icon, state, setState }: HourlyRateCalculatorProps) {
	// Define updateState using useCallback to avoid dependency cycle
	const updateState = useCallback(
		(field: string, value: unknown) => {
			setState((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[setState]
	);

	// Use effect to initialize the component with default values if needed
	useEffect(() => {
		// If default wastagePercent is provided and state doesn't have it set yet,
		// update the state with the default value
		if (defaultValues && !state.wastagePercent && defaultValues.wastagePercent) {
			updateState("wastagePercent", defaultValues.wastagePercent);
		}

		// Same for desiredMargin
		if (defaultValues && !state.desiredMargin && defaultValues.desiredMargin) {
			updateState("desiredMargin", defaultValues.desiredMargin);
		}

		// Same for commissionEnabled
		if (defaultValues && state.commissionEnabled === undefined && defaultValues.commissionEnabled !== undefined) {
			updateState("commissionEnabled", defaultValues.commissionEnabled);
		}

		// Add initial crew if none exists
		if (!state.crews || state.crews.length === 0) {
			updateState("crews", [
				{
					id: uuidv4(),
					name: "Crew 1",
					workers: [
						{
							id: uuidv4(),
							rate: 25,
							commission: 10,
						},
					],
				},
			]);
		}

		// Add initial overhead costs if none exists
		if (!state.overheadCosts || state.overheadCosts.length === 0) {
			updateState("overheadCosts", [
				{
					id: uuidv4(),
					name: "Rent/Mortgage",
					monthlyCost: 1500,
				},
			]);
		}

		// Setup initial monthly billable hours if not set
		if (!state.monthlyBillableHours) {
			updateState("monthlyBillableHours", 160);
		}

		// Setup initial daily work hours if not set
		if (!state.dailyWorkHours) {
			updateState("dailyWorkHours", 8);
		}

		// Setup initial daily billable hours if not set
		if (!state.dailyBillableHours) {
			updateState("dailyBillableHours", 6);
		}

		// Make sure showOverheadSection is set
		if (state.showOverheadSection === undefined) {
			updateState("showOverheadSection", true);
		}

		// Make sure showComparisons is set
		if (state.showComparisons === undefined) {
			updateState("showComparisons", false);
		}

		// Make sure showExplanation is set
		if (state.showExplanation === undefined) {
			updateState("showExplanation", false);
		}

		// Make sure selectedCrewId is set
		if (!state.selectedCrewId && state.crews && state.crews.length > 0) {
			updateState("selectedCrewId", state.crews[0].id);
		}
	}, [state, defaultValues, updateState]);

	// Add effect to update totalCrews whenever crews array changes
	useEffect(() => {
		if (Array.isArray(state.crews)) {
			updateState("totalCrews", state.crews.length);
		}
	}, [state.crews, updateState]);

	// Replace all the useState calls with values from the state prop
	// and update functions that modify the state
	const [totalHours, setTotalHours] = useState(1.2);
	const [wastageOnlyCost, setWastageOnlyCost] = useState(0);
	const [overheadCostPerHour, setOverheadCostPerHour] = useState(0);
	const [officeStaffCostPerHour, setOfficeStaffCostPerHour] = useState(0);
	const [totalOfficeStaffCost, setTotalOfficeStaffCost] = useState(0);

	// Calculated values
	const [totalLaborCost, setTotalLaborCost] = useState(0);
	const [totalCommission, setTotalCommission] = useState(0);
	const [totalCost, setTotalCost] = useState(0);
	const [recommendedRate, setRecommendedRate] = useState(0);

	// Helper function to update state
	const handleCommissionToggle = (enabled: boolean) => {
		updateState("commissionEnabled", enabled);
	};

	// Functions for office staff management
	const updateOfficeStaff = (id: string, field: string, value: unknown) => {
		if (!state.officeStaff) return;

		const updatedStaff = state.officeStaff.map((staff) => {
			if (staff.id === id) {
				return { ...staff, [field]: value };
			}
			return staff;
		});

		updateState("officeStaff", updatedStaff);
	};

	const removeOfficeStaff = (id: string) => {
		if (!state.officeStaff) return;

		const updatedStaff = state.officeStaff.filter((staff) => staff.id !== id);
		updateState("officeStaff", updatedStaff);
	};

	const addOfficeStaff = () => {
		if (!state.officeStaff) return;

		// Generate the ID outside of the state update to ensure it's the same for server and client
		const newId = uuidv4();
		const newStaff = {
			id: newId,
			title: "New Staff Member",
			payType: "hourly" as const,
			hourlyRate: 20,
			monthlySalary: 3500,
		};

		updateState("officeStaff", [...state.officeStaff, newStaff]);
	};

	// Functions for overhead costs management
	const updateOverheadCost = (id: string, field: string, value: unknown) => {
		const updatedCosts = state.overheadCosts.map((cost) => {
			if (cost.id === id) {
				return { ...cost, [field]: value };
			}
			return cost;
		});

		updateState("overheadCosts", updatedCosts);
	};

	const removeOverheadCost = (id: string) => {
		const updatedCosts = state.overheadCosts.filter((cost) => cost.id !== id);
		updateState("overheadCosts", updatedCosts);
	};

	const addOverheadCost = () => {
		// Generate the ID outside of the state update to ensure it's the same for server and client
		const newId = uuidv4();
		const newCost = {
			id: newId,
			name: "New Expense",
			monthlyCost: 0,
		};

		updateState("overheadCosts", [...state.overheadCosts, newCost]);
	};

	// Calculate wastage percentage based on daily work hours and billable hours
	useEffect(() => {
		if (state.dailyBillableHours > 0 && state.dailyWorkHours > 0) {
			// Calculate wastage as the percentage of non-billable time
			const nonBillableHours = state.dailyWorkHours - state.dailyBillableHours;
			const calculatedWastage = (nonBillableHours / state.dailyWorkHours) * 100;
			// Round to 1 decimal place for more precision
			updateState("wastagePercent", Math.round(calculatedWastage * 10) / 10);
		}
	}, [state.dailyWorkHours, state.dailyBillableHours, updateState]);

	// Calculate total hours whenever wastage percent changes
	useEffect(() => {
		const wastageMultiplier = 1 / (1 - state.wastagePercent / 100);
		const calculatedTotalHours = 1 * wastageMultiplier; // Using 1 hour as base for hourly rate calculations
		setTotalHours(calculatedTotalHours);
	}, [state.wastagePercent, setTotalHours]);

	// Calculate office staff cost per hour
	useEffect(() => {
		if (state.officeStaff) {
			// Calculate total monthly cost for all office staff
			let monthlyCost = 0;

			state.officeStaff.forEach((staff) => {
				// Ensure values are numbers and not NaN
				const hourlyRate = typeof staff.hourlyRate === "number" && !isNaN(staff.hourlyRate) ? staff.hourlyRate : 0;
				const monthlySalary = typeof staff.monthlySalary === "number" && !isNaN(staff.monthlySalary) ? staff.monthlySalary : 0;

				// Calculate monthly cost based on pay type
				const staffMonthlyCost =
					staff.payType === "hourly"
						? hourlyRate * 40 * 4.33 // 40 hours per week, 4.33 weeks per month
						: monthlySalary;

				monthlyCost += staffMonthlyCost;
			});

			setTotalOfficeStaffCost(monthlyCost);

			// Calculate hourly costs based on monthly billable hours - important for multiple crews
			// For 3 crews with 160 hours each = 480 total billable hours
			const totalMonthlyBillableHours = state.monthlyBillableHours * state.totalCrews;
			const perHourOfficeStaffCost = totalMonthlyBillableHours > 0 ? monthlyCost / totalMonthlyBillableHours : 0;

			setOfficeStaffCostPerHour(perHourOfficeStaffCost);
		}
	}, [state.officeStaff, state.monthlyBillableHours, state.totalCrews]);

	// Calculate overhead cost per hour
	useEffect(() => {
		const totalMonthlyOverhead = Array.isArray(state.overheadCosts) ? state.overheadCosts.reduce((sum: number, cost: OverheadCost) => sum + (cost.monthlyCost || 0), 0) : 0;

		// Calculate total monthly billable hours across all crews
		const totalMonthlyBillableHours = state.monthlyBillableHours * state.totalCrews;
		const perHourOverheadCost = totalMonthlyBillableHours > 0 ? totalMonthlyOverhead / totalMonthlyBillableHours : 0;

		setOverheadCostPerHour(perHourOverheadCost);
	}, [state.overheadCosts, state.monthlyBillableHours, state.totalCrews]);

	// Calculate all derived values when inputs change
	useEffect(() => {
		// Calculate labor and commission based on compensation model
		let laborCost = 0;
		let commission = 0;
		let wastageOnlyCost = 0;
		const billableHours = 1; // Using 1 hour as base for hourly rate calculations

		// Get per-crew values by dividing by number of crews
		const crewCount = Math.max(1, state.crews.length);

		if (state.commissionEnabled) {
			// When commission is enabled, calculate total commission percentage
			// This is per crew, so we need to divide by crew count
			const totalCommissionPercentage =
				state.crews.reduce((sum, crew) => {
					// Calculate the total commission for this crew
					const crewCommission = crew.workers.reduce((crewSum, worker) => crewSum + worker.commission, 0);
					return sum + crewCommission;
				}, 0) / crewCount;

			// For recommended rate calculations, we'll set these temporarily
			// and calculate the proper values after determining the recommended rate
			commission = 0;
			laborCost = 0;
			// No wastage calculation needed in commission mode since workers only get paid for billable hours
			wastageOnlyCost = 0;

			// Calculate recommended hourly rate
			// In commission mode, don't factor in labor costs or wastage since workers are paid commission only
			// Formula: Rate = (OverheadCost) / (BillableHours * (1 - (TotalCommissionPercentage/100) - (DesiredMargin/100)))
			const denominator = billableHours * (1 - totalCommissionPercentage / 100 - state.desiredMargin / 100);

			// Include office staff cost in the overhead
			const totalOverhead = overheadCostPerHour + officeStaffCostPerHour;

			const recommended = denominator > 0 ? totalOverhead / denominator : 0;

			// Now calculate the commission based on the recommended rate
			const estimatedRevenue = recommended * billableHours;
			commission = estimatedRevenue * (totalCommissionPercentage / 100);

			setTotalCommission(commission);
			setRecommendedRate(recommended);

			// Save recommendedRate in state for persistence
			setState((prev) => ({
				...prev,
				recommendedRate: recommended,
			}));
		} else {
			// Standard hourly rate model - account for total hours including wastage
			// Calculate per-crew costs by dividing by crew count
			const perCrewHourlyRateSum = state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.rate, 0), 0) / crewCount;

			// Calculate for a single crew
			const billableOnlyCost = perCrewHourlyRateSum * billableHours;
			laborCost = perCrewHourlyRateSum * totalHours;
			wastageOnlyCost = laborCost - billableOnlyCost;
			commission = 0;

			// Standard formula without commission, accounting for wastage and overhead
			// Formula: Rate = ((LaborCost + OverheadCost) / BillableHours) / (1 - DesiredMargin/100)
			const marginMultiplier = 1 / (1 - state.desiredMargin / 100);

			// Include office staff cost with other overhead
			const totalOverhead = overheadCostPerHour + officeStaffCostPerHour;

			// Calculate base cost per billable hour before applying margin
			const baseCostPerBillableHour = (laborCost + totalOverhead) / billableHours;

			// Apply margin multiplier to get recommended rate
			const recommended = baseCostPerBillableHour * marginMultiplier;

			setRecommendedRate(recommended);

			// Save recommendedRate in state for persistence
			setState((prev) => ({
				...prev,
				recommendedRate: recommended,
			}));
		}

		setTotalLaborCost(laborCost);
		setWastageOnlyCost(wastageOnlyCost);

		// Calculate total cost (including commission if applicable)
		const total = laborCost + commission + overheadCostPerHour + officeStaffCostPerHour;
		setTotalCost(total);
	}, [totalHours, state.crews, state.desiredMargin, state.commissionEnabled, state.wastagePercent, overheadCostPerHour, officeStaffCostPerHour, setState, setTotalLaborCost, setWastageOnlyCost, setTotalCost, setRecommendedRate]);

	// Calculate monthly billable hours based on crews
	useEffect(() => {
		// Standard working days per month (260 working days per year ÷ 12 months)
		const workingDaysPerMonth = 21.67;

		// Calculate monthly billable hours based on number of crews and daily billable hours
		const calculatedMonthlyBillableHours = state.totalCrews * state.dailyBillableHours * workingDaysPerMonth;

		// Round to nearest whole number
		updateState("monthlyBillableHours", Math.round(calculatedMonthlyBillableHours));
	}, [state.totalCrews, state.dailyBillableHours, updateState]);

	const totalMonthlyOverhead = state.overheadCosts.reduce((sum, cost) => sum + (cost.monthlyCost || 0), 0);

	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							{icon}
							<div>
								<CardTitle>{title}</CardTitle>
								<CardDescription>{description}</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4" suppressHydrationWarning>
							<div className="grid gap-2">
								<Label>Daily Work Hours vs. Billable Hours</Label>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="daily-work-hours" className="text-sm text-muted-foreground">
											Total Work Hours Per Day
										</Label>
										<Input id="daily-work-hours" type="number" min="1" max="24" value={state.dailyWorkHours || 0} onChange={(e) => updateState("dailyWorkHours", Number(e.target.value) || 0)} />
									</div>
									<div>
										<Label htmlFor="daily-billable-hours" className="text-sm text-muted-foreground">
											Billable Hours Per Day
										</Label>
										<Input id="daily-billable-hours" type="number" min="0.5" max={state.dailyWorkHours} value={state.dailyBillableHours || 0} onChange={(e) => updateState("dailyBillableHours", Number(e.target.value) || 0)} />
									</div>
								</div>
								<div className="flex items-center gap-2 mt-1 text-sm">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span>
										Time Wastage:{" "}
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<strong className="cursor-help">{state.wastagePercent}%</strong>
												</TooltipTrigger>
												<TooltipContent className="max-w-80">
													<div className="space-y-1 text-xs">
														<h4 className="font-semibold pb-1">Time Wastage Calculation</h4>
														<div>Formula: (Non-billable hours ÷ Total hours) × 100</div>
														<div>
															Calculation: ({state.dailyWorkHours - state.dailyBillableHours} ÷ {state.dailyWorkHours}) × 100 = {state.wastagePercent}%
														</div>
														<div>Non-billable hours: {state.dailyWorkHours - state.dailyBillableHours}</div>
														<div>Total hours: {state.dailyWorkHours}</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>{" "}
										({state.dailyWorkHours - state.dailyBillableHours} non-billable hours out of {state.dailyWorkHours} total hours per day)
									</span>
								</div>
							</div>

							<div className="grid gap-2">
								<CrewConfiguration serviceType={serviceType} crews={state.crews} setCrews={(crews: Crew[]) => updateState("crews", crews)} selectedCrewId={state.selectedCrewId} setSelectedCrewId={(id: string) => updateState("selectedCrewId", id)} commissionEnabled={state.commissionEnabled} onCommissionToggle={handleCommissionToggle} />
							</div>

							<Accordion type="single" collapsible value={state.showOfficeStaffSection ? "office-staff" : ""} onValueChange={(value) => updateState("showOfficeStaffSection", value === "office-staff")}>
								<AccordionItem value="office-staff">
									<AccordionTrigger className="text-base font-medium">
										<div className="flex items-center gap-2">
											<UserCog className="h-5 w-5" />
											<span>Office Staff</span>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-4 pt-2">
											<div className="flex justify-between items-center">
												<div className="space-y-1">
													<Label className="text-sm font-medium">Company-wide Office Personnel</Label>
													<p className="text-xs text-muted-foreground">Staff costs are distributed across all billable hours</p>
												</div>
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="ml-2">
														${totalOfficeStaffCost.toFixed(2)}/month
													</Badge>
												</div>
											</div>

											<Accordion type="multiple" className="space-y-2" defaultValue={state.officeStaff?.map((staff) => staff.id) || []}>
												{state.officeStaff &&
													state.officeStaff.map((staff) => (
														<AccordionItem key={staff.id} value={staff.id} className="border rounded-lg overflow-hidden">
															<AccordionTrigger className="px-4 py-3 hover:no-underline">
																<div className="flex items-center justify-between w-full mr-4">
																	<div className="flex items-center gap-2">
																		<UserCog className="h-4 w-4" />
																		<Input value={staff.title || ""} onChange={(e) => updateOfficeStaff(staff.id, "title", e.target.value)} placeholder="Staff title" className="w-60 h-8" onClick={(e) => e.stopPropagation()} />
																	</div>

																	<div className="flex items-center gap-2">
																		<Badge variant="secondary" className="text-xs">
																			{staff.payType === "hourly" ? `$${staff.hourlyRate}/hr` : `$${staff.monthlySalary}/mo`}
																		</Badge>

																		{state.officeStaff && state.officeStaff.length > 1 && (
																			<div
																				className="inline-flex items-center justify-center h-7 w-7 rounded-md text-destructive hover:text-destructive hover:bg-accent"
																				onClick={(e) => {
																					e.stopPropagation();
																					removeOfficeStaff(staff.id);
																				}}
																			>
																				<Minus className="h-4 w-4" />
																			</div>
																		)}
																	</div>
																</div>
															</AccordionTrigger>

															<AccordionContent className="px-4 pt-2 pb-4">
																<div className="space-y-4">
																	<div className="grid grid-cols-2 gap-3">
																		<div>
																			<Label className="text-sm mb-1 block">Pay Type</Label>
																			<Select value={staff.payType || "hourly"} onValueChange={(value) => updateOfficeStaff(staff.id, "payType", value as "hourly" | "salary")}>
																				<SelectTrigger>
																					<SelectValue placeholder="Select pay type" />
																				</SelectTrigger>
																				<SelectContent>
																					<SelectItem value="hourly">Hourly</SelectItem>
																					<SelectItem value="salary">Salary</SelectItem>
																				</SelectContent>
																			</Select>
																		</div>

																		{staff.payType === "hourly" ? (
																			<div>
																				<Label className="text-sm mb-1 block">Hourly Rate</Label>
																				<div className="relative">
																					<span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
																					<Input type="number" min="0" value={staff.hourlyRate || 0} onChange={(e) => updateOfficeStaff(staff.id, "hourlyRate", Number(e.target.value) || 0)} placeholder="Hourly rate" className="pl-7" />
																				</div>
																			</div>
																		) : (
																			<div>
																				<Label className="text-sm mb-1 block">Monthly Salary</Label>
																				<div className="relative">
																					<span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
																					<Input type="number" min="0" value={staff.monthlySalary || 0} onChange={(e) => updateOfficeStaff(staff.id, "monthlySalary", Number(e.target.value) || 0)} placeholder="Monthly salary" className="pl-7" />
																				</div>
																			</div>
																		)}
																	</div>

																	<div className="p-3 border rounded-md bg-muted/50">
																		<h4 className="text-sm font-medium mb-2">Cost Breakdown</h4>
																		<div className="space-y-1 text-sm">
																			{staff.payType === "hourly" ? (
																				<>
																					<div className="flex justify-between">
																						<span className="text-muted-foreground">Monthly cost:</span>
																						<span className="font-medium">${((staff.hourlyRate || 0) * 40 * 4.33).toFixed(2)}</span>
																					</div>
																					<div className="flex justify-between">
																						<span className="text-muted-foreground">Hourly equivalent:</span>
																						<span className="font-medium">${(staff.hourlyRate || 0).toFixed(2)}/hour</span>
																					</div>
																				</>
																			) : (
																				<>
																					<div className="flex justify-between">
																						<span className="text-muted-foreground">Monthly cost:</span>
																						<span className="font-medium">${(staff.monthlySalary || 0).toFixed(2)}</span>
																					</div>
																					<div className="flex justify-between">
																						<span className="text-muted-foreground">Hourly equivalent:</span>
																						<span className="font-medium">${((staff.monthlySalary || 0) / (40 * 4.33)).toFixed(2)}/hour</span>
																					</div>
																				</>
																			)}
																		</div>
																	</div>
																</div>
															</AccordionContent>
														</AccordionItem>
													))}
											</Accordion>

											<Button variant="outline" className="w-full" onClick={addOfficeStaff}>
												<Plus className="mr-2 h-4 w-4" />
												Add Office Staff
											</Button>

											<div className="p-4 border rounded-md mt-4 space-y-3">
												<h4 className="font-medium">Office Staff Cost Summary</h4>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span>Total Monthly Cost:</span>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<span className="font-medium cursor-help">${totalOfficeStaffCost.toFixed(2)}/month</span>
																</TooltipTrigger>
																<TooltipContent>
																	<div className="space-y-1 text-xs max-w-72">
																		<h4 className="font-semibold pb-1">Total Office Staff Monthly Cost</h4>
																		<div>Formula: Sum of all staff monthly costs</div>
																		<div>Calculation:</div>
																		{state.officeStaff?.map((staff) => (
																			<div key={staff.id}>
																				{staff.title}: ${staff.payType === "hourly" ? ((staff.hourlyRate || 0) * 40 * 4.33).toFixed(2) : (staff.monthlySalary || 0).toFixed(2)}
																			</div>
																		))}
																		<div className="font-medium pt-1">Total: ${totalOfficeStaffCost.toFixed(2)}</div>
																	</div>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
													<div className="flex justify-between text-sm font-medium">
														<span>Cost Per Billable Hour:</span>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<span className="font-medium cursor-help">${officeStaffCostPerHour.toFixed(2)}/hour</span>
																</TooltipTrigger>
																<TooltipContent>
																	<div className="space-y-1 text-xs max-w-72">
																		<h4 className="font-semibold pb-1">Office Staff Cost Per Billable Hour</h4>
																		<div>Formula: Total Monthly Office Staff Cost ÷ Monthly Billable Hours</div>
																		<div>
																			Calculation: ${totalOfficeStaffCost.toFixed(2)} ÷ {state.monthlyBillableHours} = ${officeStaffCostPerHour.toFixed(2)}
																		</div>
																		<div>Total Monthly Office Staff Cost: ${totalOfficeStaffCost.toFixed(2)}</div>
																		<div>Monthly Billable Hours: {state.monthlyBillableHours}</div>
																	</div>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
													<div className="text-xs text-muted-foreground mt-1">Based on {state.monthlyBillableHours} total company billable hours per month</div>
												</div>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>

							<Accordion type="single" collapsible value={state.showOverheadSection ? "overhead" : ""} onValueChange={(value) => updateState("showOverheadSection", value === "overhead")}>
								<AccordionItem value="overhead">
									<AccordionTrigger className="text-base font-medium">Other Overhead Costs</AccordionTrigger>
									<AccordionContent>
										<div className="space-y-4 pt-2">
											<div className="grid gap-2">
												<Label htmlFor="monthly-billable-hours">Monthly Billable Hours (Company-wide)</Label>
												<div className="relative">
													<Input id="monthly-billable-hours" type="number" min="1" value={state.monthlyBillableHours || 0} onChange={(e) => updateState("monthlyBillableHours", Number(e.target.value) || 0)} className="pr-24" />
													<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Auto-calculated</div>
												</div>
												<p className="text-xs text-muted-foreground">
													Based on{" "}
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help underline decoration-dotted">
																	{state.totalCrews} crew{state.totalCrews !== 1 ? "s" : ""} × {state.dailyBillableHours} billable hours × 21.67 working days per month
																</span>
															</TooltipTrigger>
															<TooltipContent className="max-w-80">
																<div className="space-y-1 text-xs">
																	<h4 className="font-semibold pb-1">Monthly Billable Hours Calculation</h4>
																	<div>Formula: Crews × Daily Billable Hours × Working Days Per Month</div>
																	<div>
																		Calculation: {state.totalCrews} × {state.dailyBillableHours} × 21.67 = {Math.round(state.totalCrews * state.dailyBillableHours * 21.67)}
																	</div>
																	<div>Total Crews: {state.totalCrews}</div>
																	<div>Daily Billable Hours: {state.dailyBillableHours}</div>
																	<div>Working Days Per Month: 21.67 (260 working days per year ÷ 12 months)</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</p>
											</div>

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<Label>Overhead Expenses (Monthly)</Label>
													<span className="text-sm text-muted-foreground">${totalMonthlyOverhead.toFixed(2)}/month</span>
												</div>

												{state.overheadCosts.map((cost) => (
													<div key={cost.id} className="flex items-center gap-2">
														<div className="grid grid-cols-2 gap-2 flex-grow">
															<Input value={cost.name || ""} onChange={(e) => updateOverheadCost(cost.id, "name", e.target.value)} placeholder="Expense name" />
															<div className="relative">
																<span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
																<Input type="number" min="0" value={cost.monthlyCost || 0} onChange={(e) => updateOverheadCost(cost.id, "monthlyCost", Number(e.target.value) || 0)} placeholder="Monthly cost" className="pl-7" />
															</div>
														</div>
														<Button variant="outline" size="icon" onClick={() => removeOverheadCost(cost.id)} disabled={state.overheadCosts.length === 1}>
															<Minus className="h-4 w-4" />
														</Button>
													</div>
												))}

												<Button variant="outline" className="w-full" onClick={addOverheadCost}>
													<Plus className="mr-2 h-4 w-4" />
													Add Expense
												</Button>

												<div className="flex justify-between pt-2 text-sm font-medium">
													<span>Overhead Cost Per Billable Hour:</span>
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help">${overheadCostPerHour.toFixed(2)}/hour</span>
															</TooltipTrigger>
															<TooltipContent>
																<div className="space-y-1 text-xs max-w-72">
																	<h4 className="font-semibold pb-1">Overhead Cost Per Billable Hour</h4>
																	<div>Formula: Total Monthly Overhead ÷ Monthly Billable Hours</div>
																	<div>
																		Calculation: ${totalMonthlyOverhead.toFixed(2)} ÷ {state.monthlyBillableHours} = ${overheadCostPerHour.toFixed(2)}
																	</div>
																	<div>Total Monthly Overhead: ${totalMonthlyOverhead.toFixed(2)}</div>
																	<div>Monthly Billable Hours: {state.monthlyBillableHours}</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</div>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>

							<div className="grid gap-2">
								<div className="flex justify-between">
									<Label htmlFor="desired-margin">Desired Profit Margin (%)</Label>
									<span>{state.desiredMargin}%</span>
								</div>
								<Slider id="desired-margin" min={0} max={80} step={1} value={[state.desiredMargin]} onValueChange={(value) => updateState("desiredMargin", value[0])} />
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Rate Analysis</CardTitle>
							<CardDescription>Real-time calculation of hourly rates for a {state.crews.length}-crew operation</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 mb-3">
								<div className="font-medium flex items-center gap-1.5 mb-1">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<circle cx="12" cy="12" r="10" />
										<path d="M12 16v-4" />
										<path d="M12 8h.01" />
									</svg>
									How Multiple Crews Affect Rates:
								</div>
								<ul className="text-sm list-disc pl-5 space-y-1">
									<li>
										<strong>Office staff costs</strong> are distributed across all billable hours
									</li>
									<li>
										<strong>Overhead expenses</strong> are shared among more crews
									</li>
									<li>
										More crews = <strong>lower cost per billable hour</strong>
									</li>
								</ul>
								{state.crews.length > 1 ? (
									<div className="text-sm mt-2 font-medium">
										You currently have {state.crews.length} crews, lowering your overhead/office cost to ${(officeStaffCostPerHour + overheadCostPerHour).toFixed(2)}/hr per crew.
									</div>
								) : (
									<div className="text-sm mt-2">Adding more crews will reduce your per-crew hourly rate.</div>
								)}
							</div>

							<Table>
								<TableBody>
									{!state.commissionEnabled && (
										<>
											<TableRow>
												<TableCell className="font-medium">Base Labor Cost (per crew, billable time only)</TableCell>
												<TableCell className="text-right">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help">${(totalLaborCost - wastageOnlyCost).toFixed(2)}</span>
															</TooltipTrigger>
															<TooltipContent>
																<div className="space-y-1 text-xs max-w-72">
																	<h4 className="font-semibold pb-1">Base Labor Cost</h4>
																	<div>Formula: Average Worker Hourly Rates per Crew × Billable Hours</div>
																	<div>Workers per Crew: {state.crews.reduce((sum, crew) => sum + crew.workers.length, 0) / Math.max(1, state.crews.length)}</div>
																	<div>Average Rate: ${state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.rate, 0), 0) / Math.max(1, state.crews.length)}</div>
																	<div>Billable Hours: 1</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Wastage Cost (non-billable time)</TableCell>
												<TableCell className="text-right">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help">${wastageOnlyCost.toFixed(2)}</span>
															</TooltipTrigger>
															<TooltipContent>
																<div className="space-y-1 text-xs max-w-72">
																	<h4 className="font-semibold pb-1">Wastage Cost</h4>
																	<div>Formula: Total Labor Cost - Base Labor Cost</div>
																	<div>
																		Calculation: ${totalLaborCost.toFixed(2)} - ${(totalLaborCost - wastageOnlyCost).toFixed(2)} = ${wastageOnlyCost.toFixed(2)}
																	</div>
																	<div>Wastage Percentage: {state.wastagePercent}%</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Total Labor Cost (per crew)</TableCell>
												<TableCell className="text-right">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help">${totalLaborCost.toFixed(2)}</span>
															</TooltipTrigger>
															<TooltipContent>
																<div className="space-y-1 text-xs max-w-72">
																	<h4 className="font-semibold pb-1">Total Labor Cost</h4>
																	<div>Formula: Average Worker Hourly Rates per Crew × Total Hours (including wastage)</div>
																	<div>
																		Calculation: ${state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.rate, 0), 0) / Math.max(1, state.crews.length)} × {totalHours.toFixed(2)} = ${totalLaborCost.toFixed(2)}
																	</div>
																	<div>Total Hours (with wastage): {totalHours.toFixed(2)}</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</TableCell>
											</TableRow>
										</>
									)}
									{state.commissionEnabled && (
										<TableRow>
											<TableCell className="font-medium">Estimated Commission (per crew/hour)</TableCell>
											<TableCell className="text-right">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="cursor-help">${totalCommission.toFixed(2)}</span>
														</TooltipTrigger>
														<TooltipContent>
															<div className="space-y-1 text-xs max-w-72">
																<h4 className="font-semibold pb-1">Estimated Commission</h4>
																<div>Formula: Estimated Revenue × Commission Percentage</div>
																<div>
																	Calculation: ${recommendedRate.toFixed(2)} × {(state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.commission, 0), 0) / Math.max(1, state.crews.length)).toFixed(1)}% = ${totalCommission.toFixed(2)}
																</div>
																<div>Estimated Revenue: ${recommendedRate.toFixed(2)}</div>
																<div>Commission Percentage: {(state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.commission, 0), 0) / Math.max(1, state.crews.length)).toFixed(1)}%</div>
															</div>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</TableCell>
										</TableRow>
									)}
									<TableRow>
										<TableCell className="font-medium">Office Staff Cost (per billable hour)</TableCell>
										<TableCell className="text-right">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help">${officeStaffCostPerHour.toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Office Staff Cost Per Billable Hour</h4>
															<div>Formula: Total Monthly Office Staff Cost ÷ Monthly Billable Hours</div>
															<div>
																Calculation: ${totalOfficeStaffCost.toFixed(2)} ÷ {state.monthlyBillableHours} = ${officeStaffCostPerHour.toFixed(2)}
															</div>
															<div>Total Monthly Office Staff Cost: ${totalOfficeStaffCost.toFixed(2)}</div>
															<div>Monthly Billable Hours: {state.monthlyBillableHours}</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="font-medium">Other Overhead Cost (per billable hour)</TableCell>
										<TableCell className="text-right">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help">${overheadCostPerHour.toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Overhead Cost Per Billable Hour</h4>
															<div>Formula: Total Monthly Overhead ÷ Monthly Billable Hours</div>
															<div>
																Calculation: ${totalMonthlyOverhead.toFixed(2)} ÷ {state.monthlyBillableHours} = ${overheadCostPerHour.toFixed(2)}
															</div>
															<div>Total Monthly Overhead: ${totalMonthlyOverhead.toFixed(2)}</div>
															<div>Monthly Billable Hours: {state.monthlyBillableHours}</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="font-medium">Total Cost (per crew/hour)</TableCell>
										<TableCell className="text-right font-bold">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help">${totalCost.toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Total Cost Per Crew Per Hour</h4>
															{state.commissionEnabled ? (
																<>
																	<div>Formula: Labor Cost + Commission + Office Staff Cost + Overhead Cost</div>
																	<div>
																		Calculation: ${totalLaborCost.toFixed(2)} + ${totalCommission.toFixed(2)} + ${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)} = ${totalCost.toFixed(2)}
																	</div>
																	<div>Labor Cost: ${totalLaborCost.toFixed(2)}</div>
																	<div>Commission: ${totalCommission.toFixed(2)}</div>
																</>
															) : (
																<>
																	<div>Formula: Labor Cost + Office Staff Cost + Overhead Cost</div>
																	<div>
																		Calculation: ${totalLaborCost.toFixed(2)} + ${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)} = ${totalCost.toFixed(2)}
																	</div>
																	<div>Labor Cost: ${totalLaborCost.toFixed(2)}</div>
																</>
															)}
															<div>Office Staff Cost: ${officeStaffCostPerHour.toFixed(2)}</div>
															<div>Overhead Cost: ${overheadCostPerHour.toFixed(2)}</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="font-medium">Profit Margin ({state.desiredMargin}%)</TableCell>
										<TableCell className="text-right">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help">${(recommendedRate - totalCost).toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Profit Margin</h4>
															<div>Formula: Recommended Rate - Total Cost</div>
															<div>
																Calculation: ${recommendedRate.toFixed(2)} - ${totalCost.toFixed(2)} = ${(recommendedRate - totalCost).toFixed(2)}
															</div>
															<div>Desired Margin: {state.desiredMargin}%</div>
															<div>This is the profit per billable hour at your recommended rate</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
									</TableRow>
									<TableRow className="border-t-2 border-primary/10">
										<TableCell className="font-medium text-lg">Recommended Hourly Rate</TableCell>
										<TableCell className="text-right font-bold text-lg">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="cursor-help">${recommendedRate.toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Recommended Hourly Rate Calculation</h4>
															{!state.commissionEnabled ? (
																<>
																	<div>Formula: ((Labor + Overhead) ÷ Billable Hours) ÷ (1 - Margin%/100)</div>
																	<div>
																		Calculation: ((${totalLaborCost.toFixed(2)} + ${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)}) ÷ 1) ÷ (1 - {state.desiredMargin}/100) = ${recommendedRate.toFixed(2)}
																	</div>
																	<div>Labor Cost: ${totalLaborCost.toFixed(2)}</div>
																	<div>Office Staff Cost: ${officeStaffCostPerHour.toFixed(2)}</div>
																	<div>Overhead Cost: ${overheadCostPerHour.toFixed(2)}</div>
																	<div>Desired Margin: {state.desiredMargin}%</div>
																	<div>Margin Multiplier: {(1 / (1 - state.desiredMargin / 100)).toFixed(3)}</div>
																</>
															) : (
																<>
																	<div>Formula: (Overhead) ÷ (Billable Hours × (1 - Commission% - Margin%))</div>
																	<div>
																		Calculation: (${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)}) ÷ (1 × (1 - {(state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.commission, 0), 0) / Math.max(1, state.crews.length)).toFixed(1)}/100 - {state.desiredMargin}/100)) = ${recommendedRate.toFixed(2)}
																	</div>
																	<div>Office Staff Cost: ${officeStaffCostPerHour.toFixed(2)}</div>
																	<div>Overhead Cost: ${overheadCostPerHour.toFixed(2)}</div>
																	<div>Commission Percentage: {(state.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.commission, 0), 0) / Math.max(1, state.crews.length)).toFixed(1)}%</div>
																	<div>Desired Margin: {state.desiredMargin}%</div>
																</>
															)}
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>

							<div className="rounded-lg bg-muted p-4">
								<h3 className="font-semibold mb-2 flex items-center">
									<Calculator className="mr-2 h-4 w-4" />
									Key Metrics
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Cost per Billable Hour</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium cursor-help">${totalCost.toFixed(2)}</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className="space-y-1 text-xs max-w-72">
														<h4 className="font-semibold pb-1">Cost Per Billable Hour</h4>
														{state.commissionEnabled ? (
															<>
																<div>Formula: Labor Cost + Commission + Office Staff Cost + Overhead Cost</div>
																<div>
																	Calculation: ${totalLaborCost.toFixed(2)} + ${totalCommission.toFixed(2)} + ${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)} = ${totalCost.toFixed(2)}
																</div>
																<div>Labor Cost: ${totalLaborCost.toFixed(2)}</div>
																<div>Commission: ${totalCommission.toFixed(2)}</div>
															</>
														) : (
															<>
																<div>Formula: Labor Cost + Office Staff Cost + Overhead Cost</div>
																<div>
																	Calculation: ${totalLaborCost.toFixed(2)} + ${officeStaffCostPerHour.toFixed(2)} + ${overheadCostPerHour.toFixed(2)} = ${totalCost.toFixed(2)}
																</div>
																<div>Labor Cost: ${totalLaborCost.toFixed(2)}</div>
															</>
														)}
														<div>Office Staff Cost: ${officeStaffCostPerHour.toFixed(2)}</div>
														<div>Overhead Cost: ${overheadCostPerHour.toFixed(2)}</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Cost per Total Hour</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium cursor-help">${(totalCost / totalHours).toFixed(2)}</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className="space-y-1 text-xs max-w-72">
														<h4 className="font-semibold pb-1">Cost Per Total Hour</h4>
														<div>Formula: Total Cost ÷ Total Hours</div>
														<div>
															Calculation: ${totalCost.toFixed(2)} ÷ {totalHours.toFixed(2)} = ${(totalCost / totalHours).toFixed(2)}
														</div>
														<div>Total Cost: ${totalCost.toFixed(2)}</div>
														<div>Total Hours: {totalHours.toFixed(2)} (including wastage)</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									{!state.commissionEnabled && (
										<div className="flex flex-col">
											<span className="text-sm text-muted-foreground">Effective Hourly Rate</span>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="font-medium cursor-help">${(recommendedRate / totalHours).toFixed(2)}</span>
													</TooltipTrigger>
													<TooltipContent>
														<div className="space-y-1 text-xs max-w-72">
															<h4 className="font-semibold pb-1">Effective Hourly Rate</h4>
															<div>Formula: Recommended Rate ÷ Total Hours</div>
															<div>
																Calculation: ${recommendedRate.toFixed(2)} ÷ {totalHours.toFixed(2)} = ${(recommendedRate / totalHours).toFixed(2)}
															</div>
															<div>Recommended Rate: ${recommendedRate.toFixed(2)}</div>
															<div>Total Hours: {totalHours.toFixed(2)} (including wastage)</div>
															<div>This is what you&apos;re effectively paying each worker per hour when accounting for wastage</div>
														</div>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									)}
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Breakeven Rate</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium cursor-help">${totalCost.toFixed(2)}/hr</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className="space-y-1 text-xs max-w-72">
														<h4 className="font-semibold pb-1">Breakeven Rate</h4>
														<div>Formula: Total Cost per Billable Hour</div>
														<div>Calculation: ${totalCost.toFixed(2)}</div>
														<div>This is the minimum hourly rate needed to cover all costs without profit</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Profit Per Billable Hour</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium cursor-help">${(recommendedRate - totalCost).toFixed(2)}</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className="space-y-1 text-xs max-w-72">
														<h4 className="font-semibold pb-1">Profit Per Billable Hour</h4>
														<div>Formula: Recommended Rate - Total Cost</div>
														<div>
															Calculation: ${recommendedRate.toFixed(2)} - ${totalCost.toFixed(2)} = ${(recommendedRate - totalCost).toFixed(2)}
														</div>
														<div>Recommended Rate: ${recommendedRate.toFixed(2)}</div>
														<div>Total Cost: ${totalCost.toFixed(2)}</div>
														<div>Profit Margin: {state.desiredMargin}%</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Monthly Overhead</span>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="font-medium cursor-help">${totalMonthlyOverhead.toFixed(2)}</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className="space-y-1 text-xs max-w-72">
														<h4 className="font-semibold pb-1">Monthly Overhead</h4>
														<div>Formula: Sum of all monthly overhead expenses</div>
														<div>Calculation:</div>
														{state.overheadCosts.map((cost) => (
															<div key={cost.id}>
																{cost.name}: ${cost.monthlyCost.toFixed(2)}
															</div>
														))}
														<div className="font-medium pt-1">Total: ${totalMonthlyOverhead.toFixed(2)}</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="h-5 w-5" />
									Rate Comparisons
								</CardTitle>
								<CardDescription>See how different variables affect your hourly rate</CardDescription>
							</div>
							<Button variant="outline" size="sm" onClick={() => updateState("showComparisons", !state.showComparisons)}>
								{state.showComparisons ? "Hide Details" : "Show Details"}
							</Button>
						</CardHeader>
						{state.showComparisons && (
							<CardContent>
								<RateComparisons baseRate={recommendedRate} baseCost={totalCost} baseMargin={state.desiredMargin} baseOverhead={totalMonthlyOverhead} monthlyBillableHours={state.monthlyBillableHours} commissionEnabled={state.commissionEnabled} commissionTotal={state.commissionEnabled ? totalCommission : 0} laborCost={totalLaborCost} wastagePercent={state.wastagePercent} />
							</CardContent>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
