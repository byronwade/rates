"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define a type for the saved rate
export interface SavedRate {
	id: string;
	name: string;
	type: "residential" | "property-management" | "single-family" | "commercial" | "septic";
	hourlyRate: number;
	lastUpdated: string;
}

// Define types for calculator state
interface OverheadCost {
	id: string;
	name: string;
	monthlyCost: string;
}

interface Worker {
	id: string;
	name: string;
	role: string;
	rate: string;
}

interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

interface CalculatorState {
	monthlyBillableHours?: number;
	overheadCosts?: OverheadCost[];
	crews?: Crew[];
	selectedCrewId?: string;
	desiredMargin?: number;
	wastagePercent?: number;
	rateName?: string;
	recommendedRate?: string | number;
	// Additional optional properties for calculator state
	businessType?: string;
	businessName?: string;
	notes?: string;
}

// Component props
interface RateSelectorProps {
	onRateSelect: (rate: SavedRate) => void;
	selectedRateId?: string;
}

export default function RateSelector({ onRateSelect, selectedRateId }: RateSelectorProps) {
	const [savedRates, setSavedRates] = useState<SavedRate[]>([]);
	const [noRatesFound, setNoRatesFound] = useState(false);
	const router = useRouter();

	// Function to get hourly rate from calculator state
	const getHourlyRate = (stateData: CalculatorState): number | null => {
		try {
			// First check if recommendedRate is already available in the state
			if (stateData.recommendedRate) {
				const rate = typeof stateData.recommendedRate === "string" ? parseFloat(stateData.recommendedRate) : stateData.recommendedRate;
				return isNaN(rate) ? null : rate;
			}
			return null;
		} catch (error) {
			console.error("Error parsing rate:", error);
			return null;
		}
	};

	// Function to load saved rates from localStorage
	const loadSavedRates = useCallback(() => {
		const rateTypes = ["residential", "property-management", "single-family", "commercial", "septic"];
		const newRates: SavedRate[] = [];
		let foundRates = false;

		rateTypes.forEach((type) => {
			try {
				const savedState = localStorage.getItem(`calculator-state-${type}`);
				if (savedState) {
					const stateData = JSON.parse(savedState) as CalculatorState;
					const hourlyRate = getHourlyRate(stateData);

					if (hourlyRate !== null) {
						foundRates = true;
						newRates.push({
							id: `${type}-${Date.now()}`, // Using a timestamp as part of the ID
							name: stateData.rateName || `${type.charAt(0).toUpperCase() + type.slice(1)} Rate`,
							type: type as "residential" | "property-management" | "single-family" | "commercial" | "septic",
							hourlyRate,
							lastUpdated: new Date().toISOString(),
						});
					}
				}
			} catch (error) {
				console.error(`Error loading ${type} rate:`, error);
			}
		});

		setSavedRates(newRates);
		setNoRatesFound(!foundRates);
	}, []);

	// Load rates from localStorage on component mount
	useEffect(() => {
		loadSavedRates();
	}, [loadSavedRates]);

	const handleSelectChange = (value: string) => {
		const selectedRate = savedRates.find((rate) => rate.id === value);
		if (selectedRate) {
			onRateSelect(selectedRate);
		}
	};

	const navigateToCalculators = () => {
		router.push("/calculators");
	};

	// If no rates were found, show a message and link to calculators
	if (noRatesFound) {
		return (
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md p-4 mb-4">
				<div className="flex items-center mb-2">
					<Calculator className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
					<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">No Saved Rates Found</h3>
				</div>
				<p className="text-sm text-yellow-700 dark:text-yellow-500 mb-3">Create at least one hourly rate using the calculator to use in your estimates.</p>
				<Button size="sm" onClick={navigateToCalculators}>
					Go to Rate Calculators
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label htmlFor="hourly-rate">Select an Hourly Rate</Label>
			<Select value={selectedRateId} onValueChange={handleSelectChange}>
				<SelectTrigger id="hourly-rate">
					<SelectValue placeholder="Choose a saved rate" />
				</SelectTrigger>
				<SelectContent>
					{savedRates.map((rate) => (
						<SelectItem key={rate.id} value={rate.id}>
							{rate.name} (${rate.hourlyRate}/hr)
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="flex justify-between items-center mt-2">
				<Button variant="outline" size="sm" onClick={loadSavedRates} className="text-xs">
					Refresh Rates
				</Button>

				<Button variant="link" size="sm" onClick={navigateToCalculators} className="text-xs">
					Manage Rates
				</Button>
			</div>
		</div>
	);
}
