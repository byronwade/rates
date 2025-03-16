"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

// Define a type for the saved rate
export interface SavedRate {
	id: string;
	name: string;
	type: "residential" | "property-management" | "single-family" | "commercial" | "septic";
	hourlyRate: number;
	lastUpdated: string;
	crewId?: string;
	crewName?: string;
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
	crewId?: string;
	crewName?: string;
	lastUpdated?: string;
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

			console.log("State data has no recommendedRate:", stateData);

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

		console.log("Starting to load saved rates");

		// Debug: List all localStorage keys
		const allKeys = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) allKeys.push(key);
		}
		console.log("All localStorage keys:", allKeys);

		// First load regular service rates
		rateTypes.forEach((type) => {
			try {
				const key = `calculator-state-${type}`;
				const savedState = localStorage.getItem(key);
				if (savedState) {
					console.log(`Found service rate for ${type}`);
					const stateData = JSON.parse(savedState) as CalculatorState;
					console.log(`Parsed state for ${type}:`, stateData);

					const hourlyRate = getHourlyRate(stateData);

					if (hourlyRate !== null) {
						foundRates = true;
						const rateId = `${type}-${Date.now()}`;
						newRates.push({
							id: rateId,
							name: stateData.rateName || `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")} Rate`,
							type: type as "residential" | "property-management" | "single-family" | "commercial" | "septic",
							hourlyRate,
							lastUpdated: stateData.lastUpdated || new Date().toISOString(),
						});
						console.log(`Added service rate for ${type}: ${hourlyRate}, ID: ${rateId}`);
					} else {
						console.warn(`No valid rate found for ${type} in:`, stateData);
					}
				} else {
					console.log(`No service rate found for ${type}`);
				}
			} catch (error) {
				console.error(`Error loading ${type} rate:`, error);
			}
		});

		// Now look for crew-specific rates in localStorage
		// For each service type, check for crew-specific rates
		rateTypes.forEach((type) => {
			// Scan all localStorage items for crew-specific rate patterns
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(`calculator-state-${type}-crew-`)) {
					try {
						console.log(`Found crew-specific rate: ${key}`);
						const savedState = localStorage.getItem(key);
						if (savedState) {
							const stateData = JSON.parse(savedState) as CalculatorState;
							console.log(`Parsed crew state for ${key}:`, stateData);

							const hourlyRate = getHourlyRate(stateData);

							if (hourlyRate !== null) {
								foundRates = true;
								const rateId = `${key}-${Date.now()}`;
								newRates.push({
									id: rateId,
									name: stateData.rateName || `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")} - ${stateData.crewName || "Crew"} Rate`,
									type: type as "residential" | "property-management" | "single-family" | "commercial" | "septic",
									hourlyRate,
									lastUpdated: stateData.lastUpdated || new Date().toISOString(),
									crewId: stateData.crewId,
									crewName: stateData.crewName,
								});
								console.log(`Added crew rate for ${type} - ${stateData.crewName}: ${hourlyRate}, ID: ${rateId}`);
							} else {
								console.warn(`No valid rate found for crew in ${key}:`, stateData);
							}
						}
					} catch (error) {
						console.error(`Error loading crew rate ${key}:`, error);
					}
				}
			}
		});

		// If no septic rate was found, create a default one
		if (!newRates.some((rate) => rate.type === "septic")) {
			const defaultSepticRate = {
				id: `septic-${Date.now()}`,
				name: "Septic Installation Rate",
				type: "septic" as const,
				hourlyRate: 175,
				lastUpdated: new Date().toISOString(),
			};
			newRates.push(defaultSepticRate);
			foundRates = true;
			console.log("Added default septic rate");
		}

		// Sort rates by type and then by name
		newRates.sort((a, b) => {
			if (a.type !== b.type) {
				return a.type.localeCompare(b.type);
			}
			return a.name.localeCompare(b.name);
		});

		console.log(`Total rates loaded: ${newRates.length}`);
		console.log("Loaded rates:", newRates);
		setSavedRates(newRates);
		setNoRatesFound(!foundRates);
	}, []);

	// Create default rates if they don't exist
	useEffect(() => {
		const initializeDefaultRates = () => {
			const rateTypes = ["residential", "property-management", "single-family", "commercial", "septic"];
			let ratesCreated = false;

			rateTypes.forEach((type) => {
				const savedRate = localStorage.getItem(`calculator-state-${type}`);

				if (!savedRate) {
					console.log(`Creating default rate for ${type}`);

					// Default rate values - adjust as needed for each service type
					const defaultRate = {
						rateName: `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")} Rate`,
						recommendedRate: type === "septic" ? 175 : 125, // Different default for septic
						serviceType: type,
						wastagePercent: 25,
						desiredMargin: 20,
						commissionEnabled: false,
						dailyWorkHours: 8,
						dailyBillableHours: 6,
						lastUpdated: new Date().toISOString(),
					};

					localStorage.setItem(`calculator-state-${type}`, JSON.stringify(defaultRate));
					ratesCreated = true;
				}
			});

			if (ratesCreated) {
				console.log("Created one or more default rates");
				// Reload rates after creating defaults
				loadSavedRates();
			}
		};

		initializeDefaultRates();
	}, [loadSavedRates]);

	// Load rates from localStorage on component mount
	useEffect(() => {
		loadSavedRates();
	}, [loadSavedRates]);

	// Auto-select septic rate if this is a septic estimate and no rate is selected
	useEffect(() => {
		if (!selectedRateId && savedRates.length > 0) {
			// Try to find a septic rate
			const septicRate = savedRates.find((rate) => rate.type === "septic");
			if (septicRate) {
				onRateSelect(septicRate);
			}
		}
	}, [savedRates, selectedRateId, onRateSelect]);

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

	// For development: Add a function to clear all rates and reset defaults
	const clearAndResetRates = () => {
		// Get all localStorage keys related to rates
		const keysToRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.includes("calculator-state-")) {
				keysToRemove.push(key);
			}
		}

		// Remove all rate keys
		keysToRemove.forEach((key) => {
			console.log(`Removing ${key} from localStorage`);
			localStorage.removeItem(key);
		});

		// Force re-initialization of default rates
		const initializeDefaultRates = () => {
			const rateTypes = ["residential", "property-management", "single-family", "commercial", "septic"];

			rateTypes.forEach((type) => {
				console.log(`Creating default rate for ${type}`);

				const defaultRate = {
					rateName: `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")} Rate`,
					recommendedRate: type === "septic" ? 175 : 125,
					serviceType: type,
					wastagePercent: 25,
					desiredMargin: 20,
					commissionEnabled: false,
					dailyWorkHours: 8,
					dailyBillableHours: 6,
					lastUpdated: new Date().toISOString(),
				};

				localStorage.setItem(`calculator-state-${type}`, JSON.stringify(defaultRate));
			});

			// Reload rates after creating defaults
			loadSavedRates();
		};

		initializeDefaultRates();
	};

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
							{rate.name} (${formatCurrency(rate.hourlyRate)}/hr)
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="flex justify-between items-center mt-2">
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={loadSavedRates} className="text-xs">
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={clearAndResetRates} className="text-xs text-red-500 hover:text-red-700">
						Reset All
					</Button>
				</div>

				<Button variant="link" size="sm" onClick={navigateToCalculators} className="text-xs">
					Manage Rates
				</Button>
			</div>
		</div>
	);
}
