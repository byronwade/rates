"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Percent, DollarSign, Clock, Building } from "lucide-react";

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
}

export default function RateComparisons({ baseRate, baseCost, baseMargin, baseOverhead, monthlyBillableHours, commissionEnabled, commissionTotal, laborCost, wastagePercent }: RateComparisonsProps) {
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

	return (
		<Tabs defaultValue="margin">
			<TabsList className="grid grid-cols-4 mb-4">
				<TabsTrigger value="margin" className="flex items-center gap-1">
					<Percent className="h-4 w-4" />
					<span>Margin</span>
				</TabsTrigger>
				<TabsTrigger value="overhead" className="flex items-center gap-1">
					<Building className="h-4 w-4" />
					<span>Overhead</span>
				</TabsTrigger>
				{commissionEnabled && (
					<TabsTrigger value="commission" className="flex items-center gap-1">
						<DollarSign className="h-4 w-4" />
						<span>Commission</span>
					</TabsTrigger>
				)}
				{!commissionEnabled && (
					<TabsTrigger value="wastage" className="flex items-center gap-1">
						<Clock className="h-4 w-4" />
						<span>Wastage</span>
					</TabsTrigger>
				)}
				<TabsTrigger value="combined" className="flex items-center gap-1">
					<span>Combined</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="margin">
				<Card>
					<CardContent className="pt-6">
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
										<TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
										<TableCell className={`text-right ${item.margin === baseMargin ? "font-bold" : ""}`}>{item.margin === baseMargin ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${(item.rate - baseRate).toFixed(2)}`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<p className="text-xs text-muted-foreground mt-3">Increasing your profit margin directly increases your hourly rate. A 5% increase in margin typically results in a 7-10% increase in rate.</p>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="overhead">
				<Card>
					<CardContent className="pt-6">
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
										<TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
										<TableCell className="text-right">{Math.abs(item.overhead - baseOverhead) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${(item.rate - baseRate).toFixed(2)}`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<p className="text-xs text-muted-foreground mt-3">
							Higher overhead costs require higher hourly rates to maintain profitability. For every $5,000 increase in monthly overhead with {monthlyBillableHours} billable hours, your rate increases by approximately ${((5000 / monthlyBillableHours) * (1 / (1 - baseMargin / 100))).toFixed(2)}/hour.
						</p>
					</CardContent>
				</Card>
			</TabsContent>

			{commissionEnabled && (
				<TabsContent value="commission">
					<Card>
						<CardContent className="pt-6">
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
											<TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
											<TableCell className="text-right">{Math.abs(item.commission - commissionTotal) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${(item.rate - baseRate).toFixed(2)}`}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<p className="text-xs text-muted-foreground mt-3">Higher commission percentages require higher hourly rates to maintain your desired profit margin. Each 5% increase in commission typically requires a 10-15% increase in your hourly rate.</p>
						</CardContent>
					</Card>
				</TabsContent>
			)}

			{!commissionEnabled && (
				<TabsContent value="wastage">
					<Card>
						<CardContent className="pt-6">
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
											<TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
											<TableCell className="text-right">{Math.abs(item.wastage - wastagePercent) < 0.01 ? "(current)" : `${item.rate > baseRate ? "+" : ""}$${(item.rate - baseRate).toFixed(2)}`}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<p className="text-xs text-muted-foreground mt-3">Higher time wastage means workers spend more non-billable time on jobs, requiring higher hourly rates to compensate. Each 10% increase in wastage typically requires a 5-15% increase in your hourly rate.</p>
						</CardContent>
					</Card>
				</TabsContent>
			)}

			<TabsContent value="combined">
				<Card>
					<CardContent className="pt-6">
						<h3 className="text-sm font-medium mb-3">Combined Impact Analysis</h3>
						<p className="text-sm text-muted-foreground mb-4">This table shows how combining changes to multiple factors affects your hourly rate.</p>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Scenario</TableHead>
									<TableHead className="text-right">Hourly Rate</TableHead>
									<TableHead className="text-right">Difference</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>Current Rate</TableCell>
									<TableCell className="text-right">${baseRate.toFixed(2)}</TableCell>
									<TableCell className="text-right">-</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>{commissionEnabled ? `Higher Commission (+5%) & Margin (+5%)` : `Higher Wastage (+10%) & Margin (+5%)`}</TableCell>
									<TableCell className="text-right">
										${commissionEnabled ? calculateRateWithCommission(commissionTotal + 5) * (1 + 5 / baseMargin) : calculateRateWithWastage(wastagePercent + 10) * (1 + 5 / baseMargin)}
										.toFixed(2)
									</TableCell>
									<TableCell className="text-right text-red-500">
										+$
										{commissionEnabled ? calculateRateWithCommission(commissionTotal + 5) * (1 + 5 / baseMargin) - baseRate : calculateRateWithWastage(wastagePercent + 10) * (1 + 5 / baseMargin) - baseRate}
										.toFixed(2)
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Higher Overhead (+$5,000) & Margin (+5%)</TableCell>
									<TableCell className="text-right">${(calculateRateWithOverhead(baseOverhead + 5000) * (1 + 5 / baseMargin)).toFixed(2)}</TableCell>
									<TableCell className="text-right text-red-500">+${(calculateRateWithOverhead(baseOverhead + 5000) * (1 + 5 / baseMargin) - baseRate).toFixed(2)}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>{commissionEnabled ? `Lower Commission (-5%) & Higher Overhead (+$5,000)` : `Lower Wastage (-10%) & Higher Overhead (+$5,000)`}</TableCell>
									<TableCell className="text-right">
										${commissionEnabled ? (calculateRateWithCommission(commissionTotal - 5) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 : (calculateRateWithWastage(wastagePercent - 10) + calculateRateWithOverhead(baseOverhead + 5000)) / 2}
										.toFixed(2)
									</TableCell>
									<TableCell className="text-right">
										${commissionEnabled ? (calculateRateWithCommission(commissionTotal - 5) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 - baseRate : (calculateRateWithWastage(wastagePercent - 10) + calculateRateWithOverhead(baseOverhead + 5000)) / 2 - baseRate}
										.toFixed(2)
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Optimal Balance (Recommended)</TableCell>
									<TableCell className="text-right font-bold text-green-600">${(baseRate * 1.1).toFixed(2)}</TableCell>
									<TableCell className="text-right text-green-600">+${(baseRate * 0.1).toFixed(2)}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
						<p className="text-xs text-muted-foreground mt-3">The optimal balance typically involves slightly higher margins with carefully managed overhead and {commissionEnabled ? "commission rates" : "time wastage"}. This provides a competitive rate while maintaining profitability.</p>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
