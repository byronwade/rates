"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHourlyRate, CalculatorInputs, CalculatorResults } from "@/helpers/rate-calculator";
import type { CalculatorState } from "@/types";

interface RateAnalysisProps {
	state: CalculatorState;
	setState?: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

export default function RateAnalysis({ state, setState }: RateAnalysisProps) {
	const [results, setResults] = useState<CalculatorResults | null>(null);
	const previousRateRef = useRef<number | undefined>(state.recommendedRate);

	useEffect(() => {
		// Convert the calculator state to the inputs required for rate calculation
		const inputs: CalculatorInputs = {
			crews: state.crews || [],
			totalCrews: state.totalCrews || 1,
			overheadCosts: state.overheadCosts || [],
			officeStaff: state.officeStaff || [],
			monthlyBillableHours: state.monthlyBillableHours || 160,
			wastagePercent: state.wastagePercent || 25,
			desiredMargin: state.desiredMargin || 30,
			commissionEnabled: state.commissionEnabled || false,
		};

		const calculatedResults = calculateHourlyRate(inputs);
		setResults(calculatedResults);

		// Only update the state if the recommended rate has actually changed
		// and is different from what's already in state or if it's not set yet
		if (setState && (state.recommendedRate === undefined || Math.abs(calculatedResults.recommendedRate - state.recommendedRate) > 0.01) && previousRateRef.current !== calculatedResults.recommendedRate) {
			previousRateRef.current = calculatedResults.recommendedRate;

			setState((prev: CalculatorState) => ({
				...prev,
				recommendedRate: calculatedResults.recommendedRate,
			}));
		}
	}, [state.crews, state.totalCrews, state.overheadCosts, state.officeStaff, state.monthlyBillableHours, state.wastagePercent, state.desiredMargin, state.commissionEnabled, state.recommendedRate, setState]);

	if (!results) {
		return null;
	}

	return (
		<Card className="bg-slate-50 dark:bg-slate-900/50 shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium">Rate Analysis</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-sm space-y-1">
					<p className="text-muted-foreground mb-2">Real-time calculation of hourly rates for a {state.totalCrews}-crew operation</p>

					<div className="border-b pb-2 mb-2">
						<p className="font-medium">How Multiple Crews Affect Rates:</p>
						<ul className="list-disc pl-5 text-muted-foreground">
							<li>Office staff costs are distributed across all billable hours</li>
							<li>Overhead expenses are shared among more crews</li>
							<li>More crews = lower cost per billable hour</li>
						</ul>
						<p className="mt-1">
							You currently have {state.totalCrews} {state.totalCrews === 1 ? "crew" : "crews"}, {state.totalCrews > 1 ? `lowering your overhead/office cost to $${(results.officeStaffCost + results.overheadCost).toFixed(2)}/hr per crew.` : "with all overhead costs allocated to this single crew."}
						</p>
					</div>

					<div className="grid grid-cols-2 gap-x-4 gap-y-1">
						<div className="text-muted-foreground">Base Labor Cost (per crew, billable time only)</div>
						<div className="text-right font-medium">${results.baseLaborCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Wastage Cost (non-billable time)</div>
						<div className="text-right font-medium">${results.wastageCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Total Labor Cost (per crew)</div>
						<div className="text-right font-medium">${results.totalLaborCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Office Staff Cost (per billable hour)</div>
						<div className="text-right font-medium">${results.officeStaffCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Other Overhead Cost (per billable hour)</div>
						<div className="text-right font-medium">${results.overheadCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Total Cost (per crew/hour)</div>
						<div className="text-right font-medium">${results.totalCost.toFixed(2)}</div>

						<div className="text-muted-foreground">Profit Margin ({state.desiredMargin}%)</div>
						<div className="text-right font-medium">${results.profitMargin.toFixed(2)}</div>

						<div className="col-span-2 border-t mt-1 pt-2">
							<div className="flex justify-between">
								<div className="font-semibold">Recommended Hourly Rate</div>
								<div className="font-bold text-lg">${results.recommendedRate.toFixed(2)}</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
