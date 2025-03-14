"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Calculator, Save, ChevronDown, ChevronUp, Percent, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CalculationExplanation from "./calculation-explanation";

export interface Worker {
	id: string;
	rate: number;
	commission: number;
}

export interface Job {
	id: string;
	name: string;
	date: string;
	jobType: string;
	billableHours: number;
	wastagePercent: number;
	totalHours: number;
	workers: Worker[];
	desiredMargin: number;
	commissionEnabled: boolean;
	totalCost: number;
	recommendedRate: number;
	actualRate: number;
	profitability: number;
}

export default function JobCalculator() {
	const { toast } = useToast();
	const [jobName, setJobName] = useState("");
	const [jobType, setJobType] = useState("installation");
	const [billableHours, setBillableHours] = useState(2);
	const [wastagePercent, setWastagePercent] = useState(20);
	const [totalHours, setTotalHours] = useState(2.4); // Calculated based on billable hours and wastage
	const [workers, setWorkers] = useState<Worker[]>([{ id: "1", rate: 25, commission: 10 }]);
	const [desiredMargin, setDesiredMargin] = useState(30);
	const [commissionEnabled, setCommissionEnabled] = useState(false);
	const [actualRate, setActualRate] = useState(0);
	const [showExplanation, setShowExplanation] = useState(false);

	// Calculated values
	const [totalLaborCost, setTotalLaborCost] = useState(0);
	const [totalCommission, setTotalCommission] = useState(0);
	const [totalCost, setTotalCost] = useState(0);
	const [recommendedRate, setRecommendedRate] = useState(0);
	const [profitability, setProfitability] = useState(0);

	// Calculate total hours whenever billable hours or wastage percent changes
	useEffect(() => {
		const wastageMultiplier = 1 + wastagePercent / 100;
		const calculatedTotalHours = billableHours * wastageMultiplier;
		setTotalHours(calculatedTotalHours);
	}, [billableHours, wastagePercent]);

	// Calculate all derived values when inputs change
	useEffect(() => {
		// Calculate labor and commission based on compensation model
		let laborCost = 0;
		let commission = 0;

		if (commissionEnabled) {
			// When commission is enabled, calculate total commission percentage
			const totalCommissionPercentage = workers.reduce((sum, worker) => sum + worker.commission, 0);

			// For actual rate calculations
			if (actualRate > 0) {
				const jobRevenue = actualRate * billableHours;
				commission = jobRevenue * (totalCommissionPercentage / 100);
				// No hourly labor cost when using commission model
				laborCost = 0;
			} else {
				// For recommended rate calculations, we'll set these temporarily
				// and calculate the proper values after determining the recommended rate
				commission = 0;
				laborCost = 0;
			}
		} else {
			// Standard hourly rate model - account for total hours including wastage
			laborCost = workers.reduce((sum, worker) => sum + worker.rate * totalHours, 0);
			commission = 0;
		}

		setTotalLaborCost(laborCost);
		setTotalCommission(commission);

		// Calculate base cost
		const baseCost = laborCost;

		// Calculate recommended hourly rate
		let recommended;

		if (commissionEnabled) {
			// When using commission model
			const totalCommissionPercentage = workers.reduce((sum, worker) => sum + worker.commission, 0);

			// Formula: Rate = BaseCost / (BillableHours * (1 - (TotalCommissionPercentage/100) - (DesiredMargin/100)))
			const denominator = billableHours * (1 - totalCommissionPercentage / 100 - desiredMargin / 100);
			recommended = denominator > 0 ? baseCost / denominator : 0;

			// Now calculate the commission based on the recommended rate
			const estimatedRevenue = recommended * billableHours;
			commission = estimatedRevenue * (totalCommissionPercentage / 100);
			setTotalCommission(commission);
		} else {
			// Standard formula without commission, accounting for wastage
			// Formula: Rate = (LaborCost / BillableHours) / (1 - DesiredMargin/100)
			const marginMultiplier = 1 / (1 - desiredMargin / 100);
			recommended = (baseCost / billableHours) * marginMultiplier;
		}

		setRecommendedRate(recommended);

		// Calculate total cost (including commission if applicable)
		const total = laborCost + commission;
		setTotalCost(total);

		// Calculate profitability
		if (actualRate > 0) {
			const actualTotal = actualRate * billableHours;
			const profit = actualTotal - total;
			const profitMargin = (profit / actualTotal) * 100;
			setProfitability(profitMargin);
		} else {
			setProfitability(0);
		}
	}, [billableHours, totalHours, workers, desiredMargin, commissionEnabled, actualRate, wastagePercent]);

	// Handle toggling commission mode
	const handleCommissionToggle = (enabled: boolean) => {
		setCommissionEnabled(enabled);

		// Reset actual rate when switching modes
		setActualRate(0);
	};

	const saveJob = () => {
		if (!jobName) {
			toast({
				title: "Job name required",
				description: "Please enter a name for this job",
			});
			return;
		}

		const job: Job = {
			id: uuidv4(),
			name: jobName,
			date: new Date().toISOString(),
			jobType,
			billableHours,
			wastagePercent,
			totalHours,
			workers,
			desiredMargin,
			commissionEnabled,
			totalCost,
			recommendedRate,
			actualRate,
			profitability,
		};

		// Get existing jobs from localStorage
		const savedJobs = localStorage.getItem("savedJobs");
		const jobs = savedJobs ? JSON.parse(savedJobs) : [];

		// Add new job and save back to localStorage
		jobs.push(job);
		localStorage.setItem("savedJobs", JSON.stringify(jobs));

		toast({
			title: "Job saved",
			description: `${jobName} has been saved successfully`,
		});

		// Reset form
		setJobName("");
		setActualRate(0);
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Job Details</CardTitle>
						<CardDescription>Enter the details of your job to calculate profitability</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="job-name">Job Name</Label>
								<Input id="job-name" placeholder="Water Heater Installation" value={jobName} onChange={(e) => setJobName(e.target.value)} />
							</div>

							<div className="grid gap-2">
								<Label htmlFor="job-type">Job Type</Label>
								<Select value={jobType} onValueChange={setJobType}>
									<SelectTrigger id="job-type">
										<SelectValue placeholder="Select job type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="installation">Installation</SelectItem>
										<SelectItem value="repair">Repair</SelectItem>
										<SelectItem value="maintenance">Maintenance</SelectItem>
										<SelectItem value="consultation">Consultation</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="billable-hours">Billable Hours</Label>
								<Input id="billable-hours" type="number" min="0.5" step="0.5" value={billableHours} onChange={(e) => setBillableHours(Number(e.target.value))} />
							</div>

							<div className="grid gap-2">
								<div className="flex justify-between">
									<Label htmlFor="wastage-percent">Time Wastage (%)</Label>
									<span>{wastagePercent}%</span>
								</div>
								<Slider id="wastage-percent" min={0} max={100} step={5} value={[wastagePercent]} onValueChange={(value) => setWastagePercent(value[0])} />
								<div className="flex justify-between text-sm text-muted-foreground">
									<span>No wastage</span>
									<span>Double time</span>
								</div>
								<div className="flex items-center gap-2 mt-1 text-sm">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span>
										Total hours: <strong>{totalHours.toFixed(1)}</strong> ({wastagePercent > 0 ? `+${wastagePercent}%` : "No"} wastage)
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<Label htmlFor="commission-toggle">{commissionEnabled ? "Commission-Based Payment" : "Hourly Rate Payment"}</Label>
								<Switch id="commission-toggle" checked={commissionEnabled} onCheckedChange={handleCommissionToggle} />
							</div>

							<div className="grid gap-2">
								<Label>{commissionEnabled ? "Workers and Commission Percentages" : "Workers and Hourly Rates"}</Label>
								<div className="space-y-3">
									{workers.map((worker, index) => (
										<div key={worker.id} className="flex items-center gap-2">
											<div className="flex-grow">
												<Label htmlFor={`worker-${worker.id}`} className="sr-only">
													Worker {index + 1} {commissionEnabled ? "Commission" : "Rate"}
												</Label>
												<div className="flex items-center">
													<span className="mr-2 text-sm text-muted-foreground">Worker {index + 1}</span>
													<div className="relative flex-grow">
														<Input
															id={`worker-${worker.id}`}
															type="number"
															min="0"
															value={commissionEnabled ? worker.commission : worker.rate}
															onChange={(e) => {
																const newWorkers = [...workers];
																if (commissionEnabled) {
																	newWorkers[index].commission = Number(e.target.value);
																} else {
																	newWorkers[index].rate = Number(e.target.value);
																}
																setWorkers(newWorkers);
															}}
															placeholder={commissionEnabled ? "Commission %" : "Hourly rate"}
															className={commissionEnabled ? "pr-8" : ""}
														/>
														{commissionEnabled && (
															<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
																<Percent className="h-4 w-4 text-muted-foreground" />
															</div>
														)}
													</div>
												</div>
											</div>
											<Button
												variant="outline"
												size="icon"
												onClick={() => {
													if (workers.length > 1) {
														setWorkers(workers.filter((_, i) => i !== index));
													}
												}}
												disabled={workers.length === 1}
											>
												-
											</Button>
										</div>
									))}
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setWorkers([...workers, { id: crypto.randomUUID(), rate: 25, commission: 10 }]);
										}}
									>
										Add Worker
									</Button>
								</div>
							</div>

							<div className="grid gap-2">
								<div className="flex justify-between">
									<Label htmlFor="desired-margin">Desired Profit Margin (%)</Label>
									<span>{desiredMargin}%</span>
								</div>
								<Slider id="desired-margin" min={0} max={80} step={1} value={[desiredMargin]} onValueChange={(value) => setDesiredMargin(value[0])} />
							</div>

							<div className="grid gap-2">
								<Label htmlFor="actual-rate">Actual Hourly Rate ($)</Label>
								<Input id="actual-rate" type="number" min="0" value={actualRate || ""} onChange={(e) => setActualRate(Number(e.target.value))} placeholder="Enter to compare with recommended rate" />
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button onClick={saveJob} className="w-full">
							<Save className="mr-2 h-4 w-4" />
							Save Job
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Profitability Analysis</CardTitle>
						<CardDescription>Real-time calculation of job profitability</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<Table>
							<TableBody>
								{!commissionEnabled && (
									<TableRow>
										<TableCell className="font-medium">Labor Cost</TableCell>
										<TableCell className="text-right">${totalLaborCost.toFixed(2)}</TableCell>
									</TableRow>
								)}
								{commissionEnabled && actualRate > 0 && (
									<TableRow>
										<TableCell className="font-medium">Commission Payout</TableCell>
										<TableCell className="text-right">${totalCommission.toFixed(2)}</TableCell>
									</TableRow>
								)}
								<TableRow>
									<TableCell className="font-medium">Total Cost</TableCell>
									<TableCell className="text-right font-bold">${totalCost.toFixed(2)}</TableCell>
								</TableRow>
							</TableBody>
						</Table>

						<div className="space-y-4">
							<div className="flex flex-col gap-1">
								<div className="flex justify-between">
									<span className="font-medium">Recommended Hourly Rate</span>
									<span className="text-xl font-bold text-primary">${recommendedRate.toFixed(2)}</span>
								</div>
								<div className="text-sm text-muted-foreground">
									Based on your desired {desiredMargin}% profit margin
									{commissionEnabled && ` (includes worker commission)`}
									{!commissionEnabled && ` (accounts for ${wastagePercent}% time wastage)`}
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<div className="flex justify-between">
									<span className="font-medium">Total Job Revenue</span>
									<span className="font-bold">${(actualRate > 0 ? actualRate * billableHours : 0).toFixed(2)}</span>
								</div>
							</div>

							{actualRate > 0 && (
								<div className="flex flex-col gap-1">
									<div className="flex justify-between">
										<span className="font-medium">Profit Margin</span>
										<span className={`font-bold ${profitability >= 0 ? "text-green-600" : "text-red-600"}`}>{profitability.toFixed(2)}%</span>
									</div>
									<div className="text-sm text-muted-foreground">{profitability >= desiredMargin ? "Above target margin ✓" : profitability >= 0 ? "Below target margin ⚠️" : "Losing money on this job ❌"}</div>
								</div>
							)}
						</div>

						<div className="rounded-lg bg-muted p-4">
							<h3 className="font-semibold mb-2 flex items-center">
								<Calculator className="mr-2 h-4 w-4" />
								Key Metrics
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col">
									<span className="text-sm text-muted-foreground">Cost per Billable Hour</span>
									<span className="font-medium">${(totalCost / billableHours).toFixed(2)}</span>
								</div>
								<div className="flex flex-col">
									<span className="text-sm text-muted-foreground">Cost per Total Hour</span>
									<span className="font-medium">${(totalCost / totalHours).toFixed(2)}</span>
								</div>
								{commissionEnabled && actualRate > 0 ? (
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Commission %</span>
										<span className="font-medium">{((totalCommission / (actualRate * billableHours)) * 100).toFixed(1)}%</span>
									</div>
								) : (
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Effective Hourly Rate</span>
										<span className="font-medium">${((recommendedRate * billableHours) / totalHours).toFixed(2)}</span>
									</div>
								)}
								{!commissionEnabled && (
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Avg Worker Rate</span>
										<span className="font-medium">${(workers.reduce((sum, w) => sum + w.rate, 0) / workers.length).toFixed(2)}</span>
									</div>
								)}
								{commissionEnabled && (
									<div className="flex flex-col">
										<span className="text-sm text-muted-foreground">Total Commission</span>
										<span className="font-medium">{workers.reduce((sum, w) => sum + w.commission, 0)}%</span>
									</div>
								)}
								<div className="flex flex-col">
									<span className="text-sm text-muted-foreground">Breakeven Rate</span>
									<span className="font-medium">${(totalCost / billableHours).toFixed(2)}/hr</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setShowExplanation(!showExplanation)}>
				{showExplanation ? (
					<>
						<ChevronUp className="h-4 w-4" />
						Hide Calculation Methodology
					</>
				) : (
					<>
						<ChevronDown className="h-4 w-4" />
						Show Calculation Methodology
					</>
				)}
			</Button>

			{showExplanation && <CalculationExplanation />}
		</div>
	);
}
