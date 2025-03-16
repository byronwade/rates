"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, DollarSign, Clock, Building, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RateComparisonsProps {
	baseRate: number;
	baseCost: number;
	baseMargin: number;
	baseOverhead: number;
	monthlyBillableHours: number;
	commissionEnabled: boolean;
	commissionTotal: number;
	laborCost: number;
	wastagePercent: number;
	crewCount?: number;
	totalMonthlyOfficeStaffCost?: number;
}

export default function RateComparisons({ baseRate, baseCost, baseMargin, baseOverhead, monthlyBillableHours, commissionEnabled, commissionTotal, laborCost, wastagePercent, crewCount = 1, totalMonthlyOfficeStaffCost = 0 }: RateComparisonsProps) {
	// Calculate rates at different margins
	const calculateRateAtMargin = (margin: number) => {
		if (commissionEnabled) {
			const denominator = 1 * (1 - commissionTotal / 100 - margin / 100);
			return denominator > 0 ? baseCost / denominator : 0;
		} else {
			const marginMultiplier = 1 / (1 - margin / 100);
			return baseCost * marginMultiplier;
		}
	};

	// Calculate rates with different overhead amounts
	const calculateRateWithOverhead = (monthlyOverhead: number) => {
		const hourlyOverhead = monthlyBillableHours > 0 ? monthlyOverhead / monthlyBillableHours : 0;
		const totalCost = baseCost - baseOverhead / monthlyBillableHours + hourlyOverhead;

		if (commissionEnabled) {
			const denominator = 1 * (1 - commissionTotal / 100 - baseMargin / 100);
			return denominator > 0 ? totalCost / denominator : 0;
		} else {
			const marginMultiplier = 1 / (1 - baseMargin / 100);
			return totalCost * marginMultiplier;
		}
	};

	// Calculate rates with different commission percentages
	const calculateRateWithCommission = (commission: number) => {
		const denominator = 1 * (1 - commission / 100 - baseMargin / 100);
		return denominator > 0 ? baseCost / denominator : 0;
	};

	// Calculate rates with different wastage percentages
	const calculateRateWithWastage = (wastage: number) => {
		if (commissionEnabled) return baseRate; // Commission model doesn't use wastage

		// Recalculate labor cost with new wastage
		const wastageMultiplier = 1 / (1 - wastage / 100);
		const billableHours = 1; // Fixed for hourly rate calculation
		const totalHours = billableHours * wastageMultiplier;

		// Assuming average worker rate
		const avgWorkerRate = laborCost / (1 / (1 - wastagePercent / 100));
		const newLaborCost = avgWorkerRate * totalHours;

		// Overhead stays the same
		const overheadPerHour = baseOverhead / monthlyBillableHours;
		const totalCost = newLaborCost + overheadPerHour;

		// Apply margin
		const marginMultiplier = 1 / (1 - baseMargin / 100);
		return (totalCost / billableHours) * marginMultiplier;
	};

	// Calculate rates with different crew count
	const calculateRateWithCrewCount = (testCrewCount: number, baseCost: number, baseOverhead: number, baseRate: number, commissionEnabled: boolean, commissionTotal: number, monthlyBillableHours: number, crewCount: number, totalMonthlyOfficeStaffCost: number) => {
		// If we have no crews, return a high value (can't operate with 0 crews)
		if (testCrewCount === 0) return 9999;

		// Calculate billable hours for this configuration
		const perCrewBillableHours = monthlyBillableHours / crewCount; // Billable hours per crew remains constant
		const totalBillableHours = perCrewBillableHours * testCrewCount; // Total billable hours changes with crew count

		// Fixed costs are distributed across the total billable hours for this configuration
		const fixedCostsPerBillableHour = (baseOverhead + totalMonthlyOfficeStaffCost) / totalBillableHours;

		// Extract labor component from baseCost (which is per billable hour)
		const originalOverheadPerHour = (baseOverhead + totalMonthlyOfficeStaffCost) / monthlyBillableHours;
		const laborOnlyPerCrew = baseCost - originalOverheadPerHour;

		// IMPORTANT: Labor cost scales with the number of crews - each crew has the same worker composition
		// Labor costs in total grow with crew count, but per billable hour remain the same
		const laborCostPerBillableHour = laborOnlyPerCrew; // Labor cost per billable hour remains the same

		// Calculate hourly rate
		let hourlyRate;

		if (commissionEnabled) {
			// With commission, we calculate based on % of revenue
			// We need to solve for rate where:
			// rate = (fixedCosts/billableHours + laborCost + (rate * commission%)) / (1 - desiredProfit%)

			// Assuming 20% desired profit margin
			const profitMargin = 0.2;

			// Solving the equation above for rate:
			hourlyRate = (fixedCostsPerBillableHour + laborCostPerBillableHour) / (1 - commissionTotal / 100 - profitMargin);
		} else {
			// Without commission, straightforward calculation
			// Total hourly cost is labor + fixed costs per billable hour
			const hourlyCost = laborCostPerBillableHour + fixedCostsPerBillableHour;

			// Apply profit margin
			hourlyRate = hourlyCost * 1.25; // 20% profit
		}

		// Round to 2 decimal places
		return Math.round(hourlyRate * 100) / 100;
	};

	// Margin comparison data
	const marginComparisons = [
		{ margin: 25, rate: calculateRateAtMargin(25) },
		{ margin: 30, rate: calculateRateAtMargin(30) },
		{ margin: 35, rate: calculateRateAtMargin(35) },
		{ margin: 40, rate: calculateRateAtMargin(40) },
		{ margin: 45, rate: calculateRateAtMargin(45) },
	];

	// Overhead comparison data
	const overheadComparisons = [
		{ overhead: 5000, rate: calculateRateWithOverhead(5000) },
		{ overhead: 10000, rate: calculateRateWithOverhead(10000) },
		{ overhead: 15000, rate: calculateRateWithOverhead(15000) },
		{ overhead: 20000, rate: calculateRateWithOverhead(20000) },
		{ overhead: 30000, rate: calculateRateWithOverhead(30000) },
	];

	// Commission comparison data (only relevant if commission is enabled)
	const commissionComparisons = [
		{ commission: 20, rate: calculateRateWithCommission(20) },
		{ commission: 25, rate: calculateRateWithCommission(25) },
		{ commission: 30, rate: calculateRateWithCommission(30) },
		{ commission: 35, rate: calculateRateWithCommission(35) },
		{ commission: 40, rate: calculateRateWithCommission(40) },
	];

	// Wastage comparison data (only relevant if hourly rate is used)
	const wastageComparisons = [
		{ wastage: 20, rate: calculateRateWithWastage(20) },
		{ wastage: 30, rate: calculateRateWithWastage(30) },
		{ wastage: 40, rate: calculateRateWithWastage(40) },
		{ wastage: 50, rate: calculateRateWithWastage(50) },
		{ wastage: 60, rate: calculateRateWithWastage(60) },
	];

	// Crew count comparison data
	const crewComparisons = [
		{ crews: 1, rate: calculateRateWithCrewCount(1, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost) },
		{ crews: 2, rate: calculateRateWithCrewCount(2, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost) },
		{ crews: 3, rate: calculateRateWithCrewCount(3, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost) },
		{ crews: 5, rate: calculateRateWithCrewCount(5, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost) },
		{ crews: 10, rate: calculateRateWithCrewCount(10, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost) },
	];

	// Find the optimal crew configuration (lowest rate with at least 15% margin)
	const optimalConfig =
		crewComparisons
			.filter((item) => {
				// Calculate key metrics for this configuration
				const perCrewBillableHours = monthlyBillableHours / item.crews;
				const totalBillableHours = perCrewBillableHours * item.crews;
				const monthlyRevenue = item.rate * totalBillableHours;

				// Calculate costs
				const fixedCosts = baseOverhead + totalMonthlyOfficeStaffCost;
				const originalOverheadPerHour = (baseOverhead + totalMonthlyOfficeStaffCost) / monthlyBillableHours;
				const laborOnlyPerCrew = baseCost - originalOverheadPerHour;

				let monthlyCost;
				if (commissionEnabled) {
					const commissionCost = monthlyRevenue * (commissionTotal / 100);
					monthlyCost = fixedCosts + commissionCost;
				} else {
					const totalLaborCost = laborOnlyPerCrew * perCrewBillableHours * item.crews;
					monthlyCost = fixedCosts + totalLaborCost;
				}

				const monthlyProfit = monthlyRevenue - monthlyCost;
				const profitMargin = monthlyProfit / monthlyRevenue;

				return profitMargin >= 0.15; // At least 15% margin
			})
			.sort((a, b) => a.rate - b.rate)[0] || crewComparisons[0]; // Sort by lowest rate and take the first one

	const optimalCrewCount = optimalConfig.crews;
	const optimalHourlyRate = optimalConfig.rate;

	return (
		<Card>
			<CardContent className="px-0 pt-0">
				<Tabs defaultValue="combined">
					<TabsList className="grid grid-cols-5 mb-4 mx-6 mt-6">
						<TabsTrigger value="margin" className="flex items-center gap-1">
							<Percent className="h-4 w-4" />
							<span>Margin</span>
						</TabsTrigger>
						<TabsTrigger value="overhead" className="flex items-center gap-1">
							<Building className="h-4 w-4" />
							<span>Overhead</span>
						</TabsTrigger>
						{commissionEnabled ? (
							<TabsTrigger value="commission" className="flex items-center gap-1">
								<DollarSign className="h-4 w-4" />
								<span>Commission</span>
							</TabsTrigger>
						) : (
							<TabsTrigger value="wastage" className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>Wastage</span>
							</TabsTrigger>
						)}
						<TabsTrigger value="crews" className="flex items-center gap-1">
							<Users className="h-4 w-4" />
							<span>Crews</span>
						</TabsTrigger>
						<TabsTrigger value="combined" className="flex items-center gap-1">
							<span>Combined</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="margin" className="mx-6">
						<h3 className="text-sm font-medium mb-3">How Different Profit Margins Affect Your Rate</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Profit Margin</TableHead>
									<TableHead className="text-right">Hourly Rate</TableHead>
									<TableHead className="text-right">Difference</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{marginComparisons.map((item) => (
									<TableRow key={item.margin}>
										<TableCell>{item.margin}%</TableCell>
										<TableCell className="text-right">${formatCurrency(item.rate)}</TableCell>
										<TableCell className={`text-right ${item.margin === baseMargin ? "font-bold" : ""}`}>{item.margin === baseMargin ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${formatCurrency(item.rate - baseRate)}`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<p className="text-xs text-muted-foreground mt-3">Increasing your profit margin directly increases your hourly rate. A 5% increase in margin typically results in a 7-10% increase in rate.</p>
					</TabsContent>

					<TabsContent value="overhead" className="mx-6">
						<h3 className="text-sm font-medium mb-3">How Different Monthly Overhead Amounts Affect Your Rate</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Monthly Overhead</TableHead>
									<TableHead className="text-right">Hourly Rate</TableHead>
									<TableHead className="text-right">Difference</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{overheadComparisons.map((item) => (
									<TableRow key={item.overhead}>
										<TableCell>${item.overhead.toLocaleString()}</TableCell>
										<TableCell className="text-right">${formatCurrency(item.rate)}</TableCell>
										<TableCell className="text-right">{Math.abs(item.overhead - baseOverhead) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${formatCurrency(item.rate - baseRate)}`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<p className="text-xs text-muted-foreground mt-3">
							Higher overhead costs require higher hourly rates to maintain profitability. For every $5,000 increase in monthly overhead with {monthlyBillableHours} billable hours, your rate increases by approximately ${formatCurrency((5000 / monthlyBillableHours) * (1 / (1 - baseMargin / 100)))}/hour.
						</p>
					</TabsContent>

					{commissionEnabled && (
						<TabsContent value="commission" className="mx-6">
							<h3 className="text-sm font-medium mb-3">How Different Commission Percentages Affect Your Rate</h3>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Total Commission</TableHead>
										<TableHead className="text-right">Hourly Rate</TableHead>
										<TableHead className="text-right">Difference</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{commissionComparisons.map((item) => (
										<TableRow key={item.commission}>
											<TableCell>{item.commission}%</TableCell>
											<TableCell className="text-right">${formatCurrency(item.rate)}</TableCell>
											<TableCell className="text-right">{Math.abs(item.commission - commissionTotal) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${formatCurrency(item.rate - baseRate)}`}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<p className="text-xs text-muted-foreground mt-3">Higher commission percentages require higher hourly rates to maintain your desired profit margin. Each 5% increase in commission typically requires a 10-15% increase in your hourly rate.</p>
						</TabsContent>
					)}

					{!commissionEnabled && (
						<TabsContent value="wastage" className="mx-6">
							<h3 className="text-sm font-medium mb-3">How Different Time Wastage Percentages Affect Your Rate</h3>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Time Wastage</TableHead>
										<TableHead className="text-right">Hourly Rate</TableHead>
										<TableHead className="text-right">Difference</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{wastageComparisons.map((item) => (
										<TableRow key={item.wastage}>
											<TableCell>{item.wastage}%</TableCell>
											<TableCell className="text-right">${formatCurrency(item.rate)}</TableCell>
											<TableCell className="text-right">{Math.abs(item.wastage - wastagePercent) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${formatCurrency(item.rate - baseRate)}`}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<p className="text-xs text-muted-foreground mt-3">Higher time wastage means workers spend more non-billable time on jobs, requiring higher hourly rates to compensate. Each 10% increase in wastage typically requires a 5-15% increase in your hourly rate.</p>
						</TabsContent>
					)}

					<TabsContent value="crews" className="mx-6">
						<h3 className="text-sm font-medium mb-3">How Different Crew Counts Affect Your Rate & Profitability</h3>

						<div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 mb-4">
							<div className="font-medium flex items-center gap-1.5 mb-1">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<circle cx="12" cy="12" r="10" />
									<path d="M12 16v-4" />
									<path d="M12 8h.01" />
								</svg>
								Important Note About Hypothetical Crew Counts:
							</div>
							<p className="text-sm">Each crew configuration below maintains the same worker composition as your current crews. For example, if you currently have 3 crews with 2 workers each at $40/hour, then the 10-crew scenario would represent 10 crews with 2 workers each at $40/hour (20 workers total). This helps you understand how scaling affects your rate and profitability.</p>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Number of Crews</TableHead>
									<TableHead className="text-right">Hourly Rate</TableHead>
									<TableHead className="text-right">Fixed Cost/Hour</TableHead>
									<TableHead className="text-right">Monthly Revenue</TableHead>
									<TableHead className="text-right">Monthly Profit</TableHead>
									<TableHead className="text-right">Profitability Index</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{crewComparisons.map((item) => {
									// Calculate fixed cost per billable hour
									const perCrewBillableHours = monthlyBillableHours / item.crews;
									const totalBillableHours = perCrewBillableHours * item.crews;
									const fixedCosts = baseOverhead + totalMonthlyOfficeStaffCost;
									const fixedCostPerHour = fixedCosts / totalBillableHours;

									// Calculate monthly revenue and profit
									const monthlyRevenue = item.rate * totalBillableHours;

									// Calculate total monthly cost
									let monthlyCost;
									if (commissionEnabled) {
										// For commission model
										const commissionCost = monthlyRevenue * (commissionTotal / 100);
										monthlyCost = fixedCosts + commissionCost;
									} else {
										// For hourly model with wastage
										// Extract the labor component from baseCost
										const originalOverheadPerHour = (baseOverhead + totalMonthlyOfficeStaffCost) / monthlyBillableHours;
										const laborOnlyPerCrew = baseCost - originalOverheadPerHour;

										// IMPORTANT: Labor scales with crew count - each crew has the same workers
										const totalLaborCost = laborOnlyPerCrew * perCrewBillableHours * item.crews;
										monthlyCost = fixedCosts + totalLaborCost;
									}

									const monthlyProfit = monthlyRevenue - monthlyCost;
									const profitMargin = monthlyProfit / monthlyRevenue;

									// Calculate profitability index (lower rate + higher profit = better)
									// Normalize the rate (lower is better) and profit (higher is better)
									const rateScore = 1 - item.rate / (crewComparisons[crewComparisons.length - 1].rate * 2); // Lower rate gets higher score
									const profitScore = profitMargin > 0 ? Math.min(profitMargin / 0.5, 1) : 0; // Higher profit percentage gets higher score
									// Prioritize rate competitiveness more heavily than profit margins
									const profitabilityIndex = rateScore * 0.7 + profitScore * 0.3; // Weight rate 70%, profit 30%

									// Determine if this configuration is optimal - focusing on profitability and rate
									const isOptimal =
										profitMargin >= 0.15 && // At least 15% margin
										(item.crews === crewCount || // Current configuration
											// Or the best rate with adequate profit margin
											item.rate ===
												Math.min(
													...crewComparisons
														.filter((c) => {
															// Calculate profit margin for this configuration
															const thisBillableHours = perCrewBillableHours * c.crews;
															const thisRevenue = c.rate * thisBillableHours;

															// Calculate labor cost - scales with crew count
															let thisMonthlyLaborCost;
															if (commissionEnabled) {
																thisMonthlyLaborCost = thisRevenue * (commissionTotal / 100);
															} else {
																const thisOriginalOverheadPerHour = (baseOverhead + totalMonthlyOfficeStaffCost) / monthlyBillableHours;
																const thisLaborOnlyPerCrew = baseCost - thisOriginalOverheadPerHour;
																thisMonthlyLaborCost = thisLaborOnlyPerCrew * perCrewBillableHours * c.crews;
															}

															const thisTotalCost = fixedCosts + thisMonthlyLaborCost;
															const thisProfit = thisRevenue - thisTotalCost;
															const thisProfitMargin = thisProfit / thisRevenue;

															return thisProfitMargin >= 0.15;
														})
														.map((c) => c.rate)
												));

									return (
										<TableRow key={item.crews} className={isOptimal ? "bg-green-50" : ""}>
											<TableCell className={item.crews === crewCount ? "font-medium" : ""}>
												{item.crews} {item.crews === 1 ? "crew" : "crews"}
												{item.crews === crewCount && " (current)"}
												{isOptimal && <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">optimal</span>}
											</TableCell>
											<TableCell className="text-right font-medium">
												${formatCurrency(item.rate)}
												<div className="text-xs text-muted-foreground">{item.crews !== crewCount && `${item.rate < baseRate ? "-" : "+"}$${formatCurrency(Math.abs(item.rate - baseRate))}`}</div>
											</TableCell>
											<TableCell className="text-right">${formatCurrency(fixedCostPerHour)}</TableCell>
											<TableCell className="text-right">${formatCurrency(monthlyRevenue)}</TableCell>
											<TableCell className="text-right">
												${formatCurrency(monthlyProfit)}
												<div className="text-xs font-medium text-muted-foreground">{Math.round(profitMargin * 100)}% margin</div>
											</TableCell>
											<TableCell className="text-right">
												<div className={`font-medium ${profitabilityIndex > 0.6 ? "text-green-600" : profitabilityIndex > 0.4 ? "text-amber-600" : "text-red-500"}`}>{(profitabilityIndex * 10).toFixed(1)}</div>
												<div className="text-xs text-muted-foreground">{profitabilityIndex > 0.6 ? "Excellent" : profitabilityIndex > 0.4 ? "Good" : "Poor"}</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						<div className="mt-4 space-y-2 text-sm">
							<h4 className="font-medium">Rate Minimization Strategy:</h4>
							<p className="text-muted-foreground">
								<strong className="text-green-700">Our goal is to minimize your hourly rate</strong> while maintaining healthy profit margins. The optimal configurations (highlighted) achieve the lowest sustainable rates without sacrificing profitability.
							</p>
							<div className="flex items-center gap-2 mt-2">
								<div className="p-2 bg-muted rounded-md">
									<strong>Profitability Index</strong> (0-10): Prioritizes rate competitiveness (70%) over profit margin (30%). Higher is better.
								</div>
							</div>
							<p className="text-xs text-muted-foreground pt-2">
								As you add more crews, your fixed costs are spread over more billable hours, reducing your hourly rate while potentially increasing total profit. The economic sweet spot is where you achieve the <strong>lowest possible rate</strong> while maintaining sufficient profit margins to sustain and grow your business.
							</p>
						</div>
					</TabsContent>

					<TabsContent value="combined" className="mx-6">
						<h3 className="text-sm font-medium mb-3">Recommended Strategy</h3>

						<div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 mb-4">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<div>
									<h4 className="font-medium">Optimal Configuration</h4>
									<p className="text-sm mt-1">Based on your inputs, the optimal crew configuration for maximizing your profitability while keeping rates competitive is:</p>
								</div>
								<div className="flex flex-col items-center md:items-end">
									<div className="text-2xl font-bold">{optimalCrewCount} crews</div>
									<div className="text-sm">at ${formatCurrency(optimalHourlyRate)}/hr</div>
								</div>
							</div>

							<p className="text-sm mt-3">
								<strong>How this is calculated:</strong> Each crew configuration assumes the same worker composition (same number of workers per crew and same hourly rates). Fixed overhead costs are distributed across more billable hours with more crews, while labor costs scale proportionally with crew count. The optimal configuration balances lower rates with sustainable profit margins.
							</p>
						</div>

						<div className="space-y-4">
							<TableRow>
								<TableCell>Current Configuration</TableCell>
								<TableCell className="text-right">${formatCurrency(baseRate)}</TableCell>
								<TableCell className="text-right">-</TableCell>
								<TableCell className="text-right">{baseMargin}% margin</TableCell>
							</TableRow>

							{crewCount < 3 && (
								<TableRow className="bg-green-50">
									<TableCell className="font-medium">
										Increase to {crewCount + 2} Crews +{commissionEnabled ? " Lower Commission (2%)" : " Reduce Wastage (5%)"}
									</TableCell>
									{(() => {
										const optimalRate = calculateRateWithCrewCount(crewCount + 2, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, 2, totalMonthlyOfficeStaffCost);
										const adjustedRate = commissionEnabled ? calculateRateWithCommission(commissionTotal - 2) : calculateRateWithWastage(wastagePercent - 5);
										const combinedRate = (optimalRate + adjustedRate) / 2;
										const rateDiff = combinedRate - baseRate;
										return (
											<>
												<TableCell className="text-right font-medium">${formatCurrency(combinedRate)}</TableCell>
												<TableCell className="text-right text-green-600">${formatCurrency(rateDiff)}</TableCell>
												<TableCell className="text-right">
													{baseMargin}% margin
													<div className="text-xs text-green-600">+ Higher volume</div>
												</TableCell>
											</>
										);
									})()}
								</TableRow>
							)}

							<TableRow>
								<TableCell>{crewCount > 1 ? "Maintain Current Crews" : "Add One Crew"} + Higher Margin (+5%)</TableCell>
								<TableCell className="text-right">${formatCurrency(calculateRateAtMargin(baseMargin + 5))}</TableCell>
								<TableCell className="text-right text-red-500">+${formatCurrency(calculateRateAtMargin(baseMargin + 5) - baseRate)}</TableCell>
								<TableCell className="text-right">{baseMargin + 5}% margin</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>{commissionEnabled ? `Lower Commission (-5%) & Higher Overhead (+$5,000)` : `Lower Wastage (-10%) & Higher Overhead (+$5,000)`}</TableCell>
								<TableCell className="text-right">${formatCurrency(commissionEnabled ? (calculateRateWithCommission(commissionTotal - 5) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 : (calculateRateWithWastage(wastagePercent - 10) + calculateRateWithOverhead(baseOverhead + 5000)) / 2)}</TableCell>
								<TableCell className="text-right">${formatCurrency(commissionEnabled ? (calculateRateWithCommission(commissionTotal - 5) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 - baseRate : (calculateRateWithWastage(wastagePercent - 10) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 - baseRate)}</TableCell>
								<TableCell className="text-right">{baseMargin}% margin</TableCell>
							</TableRow>

							<TableRow>
								<TableCell>Double Crews & Reduce Overhead (-$2,000)</TableCell>
								{(() => {
									const doubleCrewRate = calculateRateWithCrewCount(crewCount * 2, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, 2, totalMonthlyOfficeStaffCost);
									const reducedOverheadRate = calculateRateWithOverhead(Math.max(3000, baseOverhead - 2000));
									const combinedRate = (doubleCrewRate + reducedOverheadRate) / 2;
									return (
										<>
											<TableCell className="text-right">${formatCurrency(combinedRate)}</TableCell>
											<TableCell className="text-right text-green-600">${formatCurrency(combinedRate - baseRate)}</TableCell>
											<TableCell className="text-right">
												{baseMargin}% margin
												<div className="text-xs text-green-600">+ Double revenue</div>
											</TableCell>
										</>
									);
								})()}
							</TableRow>

							<TableRow className="border-t-2">
								<TableCell className="font-medium">Recommended Strategy</TableCell>
								{(() => {
									// Find optimal crew count that produces the lowest rate while maintaining acceptable profit
									let lowestRate = 99999;
									let optimalCrewCount = crewCount;

									for (let c = 1; c <= 10; c++) {
										const testRate = calculateRateWithCrewCount(c, baseCost, baseOverhead, baseRate, commissionEnabled, commissionTotal, monthlyBillableHours, crewCount, totalMonthlyOfficeStaffCost);

										// Calculate profit margin at this crew count
										const perCrewBillableHours = monthlyBillableHours / crewCount; // Per-crew billable hours stays constant
										const totalBillableHours = perCrewBillableHours * c; // Total billable hours for this config
										const monthlyRevenue = testRate * totalBillableHours;
										const fixedCosts = baseOverhead + totalMonthlyOfficeStaffCost;

										// Extract labor component from baseCost
										const originalOverheadPerHour = (baseOverhead + totalMonthlyOfficeStaffCost) / monthlyBillableHours;
										const laborOnlyPerCrew = baseCost - originalOverheadPerHour;

										// Calculate monthly labor costs based on billing model
										let monthlyLaborCost;
										if (commissionEnabled) {
											monthlyLaborCost = monthlyRevenue * (commissionTotal / 100);
										} else {
											monthlyLaborCost = laborOnlyPerCrew * perCrewBillableHours * c;
										}

										const totalMonthlyCost = fixedCosts + monthlyLaborCost;
										const monthlyProfit = monthlyRevenue - totalMonthlyCost;
										const profitMargin = monthlyProfit / monthlyRevenue;

										// Only consider this rate if it maintains at least 15% profit margin
										if (profitMargin >= 0.15 && testRate < lowestRate) {
											lowestRate = testRate;
											optimalCrewCount = c;
										}
									}

									const optimalRate = crewComparisons.find((c) => c.crews === optimalCrewCount)?.rate || baseRate;

									return (
										<div>
											{optimalCrewCount !== crewCount ? (
												<p className="text-emerald-600 dark:text-emerald-400 font-medium">
													Adjust to {optimalCrewCount} crew{optimalCrewCount !== 1 ? "s" : ""} for an optimal rate of ${formatCurrency(optimalRate)}/hour
													<span className="block text-sm mt-1 text-gray-600 dark:text-gray-400">This provides the lowest sustainable rate while maintaining healthy profit margins</span>
												</p>
											) : (
												<p className="text-emerald-600 dark:text-emerald-400 font-medium">
													Your current crew count of {crewCount} is optimal at ${formatCurrency(baseRate)}/hour
													<span className="block text-sm mt-1 text-gray-600 dark:text-gray-400">This provides the best balance between competitive rates and sustainable profits</span>
												</p>
											)}
										</div>
									);
								})()}
							</TableRow>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}


