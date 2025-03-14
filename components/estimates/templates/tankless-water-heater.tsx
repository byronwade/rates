"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator, Clock, Package, SaveIcon, Droplets } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RateSelector, { SavedRate } from "../rate-selector";
import { LineItem } from "../estimate-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TanklessWaterHeaterTemplate() {
	// State for the estimate
	const [projectName, setProjectName] = useState("Tankless Water Heater Installation");
	const [selectedRate, setSelectedRate] = useState<SavedRate | null>(null);
	const [lineItems, setLineItems] = useState<LineItem[]>([]);
	const [materialMarkup, setMaterialMarkup] = useState(40); // Default 40% markup

	// Apply markup to material cost - wrapped in useCallback to prevent recreation on every render
	const applyMaterialMarkup = useCallback(
		(basePrice: number, markup: number = materialMarkup): number => {
			const markupMultiplier = 1 + markup / 100;
			return basePrice * markupMultiplier;
		},
		[materialMarkup]
	);

	// Add predefined template items when a rate is selected
	useEffect(() => {
		if (selectedRate) {
			const hourlyRate = selectedRate.hourlyRate;

			// For material prices, we'll store the base cost and apply markup when displaying
			// Create template items for tankless water heater
			const templateItems: LineItem[] = [
				{
					id: crypto.randomUUID(),
					name: "Remove old water heater",
					description: "Labor to remove and dispose of old water heater",
					type: "labor",
					quantity: 1,
					hours: 1,
					price: hourlyRate,
					totalPrice: hourlyRate,
				},
				{
					id: crypto.randomUUID(),
					name: "Install tankless water heater",
					description: "Labor to mount and install new tankless unit",
					type: "labor",
					quantity: 1,
					hours: 3.5,
					price: hourlyRate,
					totalPrice: hourlyRate * 3.5,
				},
				{
					id: crypto.randomUUID(),
					name: "Water Line Connections",
					description: "Labor to connect water lines",
					type: "labor",
					quantity: 1,
					hours: 1.5,
					price: hourlyRate,
					totalPrice: hourlyRate * 1.5,
				},
				{
					id: crypto.randomUUID(),
					name: "Gas Line Installation",
					description: "Labor to install/modify gas line for tankless unit",
					type: "labor",
					quantity: 1,
					hours: 2,
					price: hourlyRate,
					totalPrice: hourlyRate * 2,
				},
				{
					id: crypto.randomUUID(),
					name: "Venting Installation",
					description: "Labor to install proper venting for tankless unit",
					type: "labor",
					quantity: 1,
					hours: 2,
					price: hourlyRate,
					totalPrice: hourlyRate * 2,
				},
				{
					id: crypto.randomUUID(),
					name: "Electrical Hookup",
					description: "Labor to connect electrical components",
					type: "labor",
					quantity: 1,
					hours: 1,
					price: hourlyRate,
					totalPrice: hourlyRate,
				},
				{
					id: crypto.randomUUID(),
					name: "Test and inspect installation",
					description: "Labor to test all connections and verify proper operation",
					type: "labor",
					quantity: 1,
					hours: 1,
					price: hourlyRate,
					totalPrice: hourlyRate,
				},
				// Materials with base prices (without markup)
				{
					id: crypto.randomUUID(),
					name: "Tankless Water Heater Unit",
					description: "High-efficiency tankless water heater",
					type: "material",
					quantity: 1,
					price: 1200, // Base cost
					totalPrice: applyMaterialMarkup(1200, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Stainless Steel Venting Kit",
					description: "Proper venting components for tankless unit",
					type: "material",
					quantity: 1,
					price: 250, // Base cost
					totalPrice: applyMaterialMarkup(250, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Gas Line Materials",
					description: "Fittings, pipe, and connectors for gas line",
					type: "material",
					quantity: 1,
					price: 120, // Base cost
					totalPrice: applyMaterialMarkup(120, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Water Line Connectors",
					description: "Braided stainless steel connectors and valves",
					type: "material",
					quantity: 1,
					price: 75, // Base cost
					totalPrice: applyMaterialMarkup(75, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Electrical Components",
					description: "Wire, circuit breaker, and electrical supplies",
					type: "material",
					quantity: 1,
					price: 85, // Base cost
					totalPrice: applyMaterialMarkup(85, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Mounting Hardware",
					description: "Brackets and fasteners for secure installation",
					type: "material",
					quantity: 1,
					price: 45, // Base cost
					totalPrice: applyMaterialMarkup(45, materialMarkup), // With markup
				},
				{
					id: crypto.randomUUID(),
					name: "Permit Fee",
					description: "Local permitting fees",
					type: "material",
					quantity: 1,
					price: 120, // Base cost
					totalPrice: applyMaterialMarkup(120, materialMarkup), // With markup
				},
			];

			setLineItems(templateItems);
		}
	}, [selectedRate, materialMarkup, applyMaterialMarkup]);

	// Update material markup and recalculate totals
	const updateMaterialMarkup = (newMarkup: number) => {
		setMaterialMarkup(newMarkup);

		// Update material prices with new markup
		const updatedItems = lineItems.map((item) => {
			if (item.type === "material") {
				return {
					...item,
					totalPrice: applyMaterialMarkup(item.price * item.quantity, newMarkup),
				};
			}
			return item;
		});

		setLineItems(updatedItems);
	};

	// Add a new line item
	const addLineItem = (type: "labor" | "material") => {
		const newItem: LineItem = {
			id: crypto.randomUUID(),
			name: type === "labor" ? "Additional Labor" : "Additional Material",
			description: "",
			type,
			quantity: 1,
			hours: type === "labor" ? 1 : undefined,
			price: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
			totalPrice: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
		};

		setLineItems([...lineItems, newItem]);
	};

	// Remove a line item
	const removeLineItem = (id: string) => {
		setLineItems(lineItems.filter((item) => item.id !== id));
	};

	// Update a line item
	const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
		const updatedItems = lineItems.map((item) => {
			if (item.id === id) {
				const updatedItem = { ...item, [field]: value };

				// Recalculate total if quantity, price, or hours changes
				if (field === "quantity" || field === "price" || field === "hours") {
					if (item.type === "labor" && updatedItem.hours) {
						updatedItem.totalPrice = Number(updatedItem.hours) * Number(updatedItem.price);
					} else if (item.type === "material") {
						// For materials, apply markup to the total
						const baseTotal = Number(updatedItem.quantity) * Number(updatedItem.price);
						updatedItem.totalPrice = applyMaterialMarkup(baseTotal);
					}
				}

				return updatedItem;
			}
			return item;
		});

		setLineItems(updatedItems);
	};

	// Handle rate selection
	const handleRateSelect = (rate: SavedRate) => {
		setSelectedRate(rate);
	};

	// Calculate totals and profit
	const totalLaborHours = lineItems.filter((item) => item.type === "labor").reduce((sum, item) => sum + (item.hours || 0), 0);
	const totalLaborCost = lineItems.filter((item) => item.type === "labor").reduce((sum, item) => sum + item.totalPrice, 0);

	// For materials, we track both the base cost and marked up cost
	const materialItems = lineItems.filter((item) => item.type === "material");
	const baseMaterialCost = materialItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const totalMaterialCost = materialItems.reduce((sum, item) => sum + item.totalPrice, 0);

	// Calculate material profit
	const materialProfit = totalMaterialCost - baseMaterialCost;

	// Calculate total estimate
	const totalEstimate = totalLaborCost + totalMaterialCost;

	// Save the estimate
	const saveEstimate = () => {
		// Get existing saved estimates or initialize empty array
		const savedEstimates = JSON.parse(localStorage.getItem("saved-estimates") || "[]");

		const newEstimate = {
			id: crypto.randomUUID(),
			projectName,
			lineItems,
			selectedRate,
			totalLaborHours,
			totalLaborCost,
			baseMaterialCost,
			totalMaterialCost,
			materialProfit,
			materialMarkup,
			totalEstimate,
			date: new Date().toISOString(),
			template: "tankless-water-heater",
		};

		// Add to saved estimates
		savedEstimates.push(newEstimate);
		localStorage.setItem("saved-estimates", JSON.stringify(savedEstimates));

		// Show confirmation
		alert("Estimate saved successfully!");
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-center">
					<div className="mr-4">
						<Droplets className="h-8 w-8 text-blue-500" />
					</div>
					<div>
						<CardTitle>Tankless Water Heater Installation</CardTitle>
						<CardDescription>Estimate template with predefined labor and materials for tankless systems</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="project-name">Project Name</Label>
							<Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1" />
						</div>
						<div>
							<RateSelector onRateSelect={handleRateSelect} selectedRateId={selectedRate?.id} />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="material-markup">Material Markup Percentage</Label>
							<div className="flex items-center gap-2">
								<Input id="material-markup" type="number" min="0" max="200" value={materialMarkup} onChange={(e) => updateMaterialMarkup(Number(e.target.value))} className="mt-1" />
								<span>%</span>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="text-lg font-medium">Line Items</h3>

						{lineItems.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Description</TableHead>
										<TableHead>Type</TableHead>
										<TableHead className="text-right">Qty</TableHead>
										<TableHead className="text-right">Hours</TableHead>
										<TableHead className="text-right">Rate</TableHead>
										<TableHead className="text-right">Total</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{lineItems.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<div className="space-y-1">
													<Input value={item.name} onChange={(e) => updateLineItem(item.id, "name", e.target.value)} className="font-medium mb-1" />
													<Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Description" className="text-sm" />
												</div>
											</TableCell>
											<TableCell>
												<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.type === "labor" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
													{item.type === "labor" ? (
														<>
															<Clock className="mr-1 h-3 w-3" />
															Labor
														</>
													) : (
														<>
															<Package className="mr-1 h-3 w-3" />
															Material
														</>
													)}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} className="w-16 text-right" />
											</TableCell>
											<TableCell className="text-right">{item.type === "labor" ? <Input type="number" min="0.25" step="0.25" value={item.hours} onChange={(e) => updateLineItem(item.id, "hours", Number(e.target.value))} className="w-16 text-right" /> : "—"}</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end">
													<span className="mr-1">$</span>
													{item.type === "material" ? (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Input type="number" min="0" value={item.price} onChange={(e) => updateLineItem(item.id, "price", Number(e.target.value))} className="w-20 text-right" />
																</TooltipTrigger>
																<TooltipContent side="left">
																	<p className="text-xs">Base price before markup</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													) : (
														<Input type="number" min="0" value={item.price} onChange={(e) => updateLineItem(item.id, "price", Number(e.target.value))} className="w-20 text-right" />
													)}
												</div>
											</TableCell>
											<TableCell className="text-right font-medium">
												{item.type === "material" ? (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<span className="cursor-help">${item.totalPrice.toFixed(2)}</span>
															</TooltipTrigger>
															<TooltipContent side="left">
																<div className="text-xs space-y-1">
																	<p>Base: ${(item.price * item.quantity).toFixed(2)}</p>
																	<p>Markup: {materialMarkup}%</p>
																	<p>Profit: ${(item.totalPrice - item.price * item.quantity).toFixed(2)}</p>
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												) : (
													<span>${item.totalPrice.toFixed(2)}</span>
												)}
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
													<Trash2 className="h-4 w-4 text-muted-foreground" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="border rounded-lg p-8 text-center">
								<p className="text-muted-foreground">No line items added yet. Select a rate to load template items or add items manually.</p>
							</div>
						)}

						<div className="flex space-x-2 mt-4">
							<Button variant="outline" onClick={() => addLineItem("labor")} disabled={!selectedRate}>
								Add Labor
							</Button>
							<Button variant="outline" onClick={() => addLineItem("material")}>
								Add Material
							</Button>
						</div>
					</div>

					<div className="border rounded-lg p-4 bg-muted/50 space-y-3">
						<h3 className="font-medium flex items-center">
							<Calculator className="mr-2 h-4 w-4" />
							Estimate Summary
						</h3>

						<div className="space-y-1">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Labor Hours:</span>
								<span className="font-medium">{totalLaborHours} hrs</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Labor Cost:</span>
								<span className="font-medium">${totalLaborCost.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Base Material Cost:</span>
								<span className="font-medium">${baseMaterialCost.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Material Cost (with {materialMarkup}% markup):</span>
								<span className="font-medium">${totalMaterialCost.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-green-600">
								<span>Material Profit:</span>
								<span className="font-medium">${materialProfit.toFixed(2)}</span>
							</div>
							<div className="pt-2 mt-2 border-t flex justify-between text-lg">
								<span className="font-medium">Total Estimate:</span>
								<span className="font-bold">${totalEstimate.toFixed(2)}</span>
							</div>
						</div>
					</div>

					<div className="pt-4 border-t">
						<Button className="w-full" onClick={saveEstimate} disabled={!selectedRate || lineItems.length === 0}>
							<SaveIcon className="mr-2 h-4 w-4" />
							Save Estimate
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
