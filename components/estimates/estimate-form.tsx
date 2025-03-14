"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash, File, Clock, ShoppingBag, FilePlus2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import RateSelector, { SavedRate } from "./rate-selector";

export type RateInfo = {
	name: string;
	type: string;
	rate: number;
};

export interface LineItem {
	id: string;
	name: string;
	description: string;
	type: "labor" | "material";
	quantity: number;
	price: number;
	hours?: number;
	totalPrice: number;
}

interface Estimate {
	id: string;
	projectName: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	selectedRate: SavedRate | null;
	lineItems: LineItem[];
	projectNotes: string;
	totalLaborHours: number;
	totalLaborCost: number;
	baseMaterialCost: number;
	totalMaterialCost: number;
	materialProfit: number;
	totalEstimate: number;
	dateCreated: string;
	template?: string;
}

interface EstimateTemplate {
	id: string;
	name: string;
	lineItems: LineItem[];
	dateCreated: string;
}

interface EstimateFormProps {
	savedRates: RateInfo[];
	defaultProjectName?: string;
	defaultLineItems?: LineItem[];
	isTemplate?: boolean;
	templateName?: string;
}

// Function to fetch default saved rates
const getSavedRates = (): RateInfo[] => {
	// In a real implementation, this would fetch from a database
	// This is a client-side mock for demonstration
	return [
		{ name: "Residential Standard", type: "residential", rate: 150 },
		{ name: "Commercial Standard", type: "commercial", rate: 200 },
		{ name: "Property Management", type: "property-management", rate: 125 },
		{ name: "Single Family Home", type: "single-family", rate: 175 },
	];
};

export default function EstimateForm({ savedRates = [], defaultProjectName = "", defaultLineItems = [], isTemplate = false, templateName = "" }: EstimateFormProps) {
	// State for estimate details
	const [projectName, setProjectName] = useState(defaultProjectName);
	const [clientName, setClientName] = useState("");
	const [clientEmail, setClientEmail] = useState("");
	const [clientPhone, setClientPhone] = useState("");
	const [selectedRate, setSelectedRate] = useState<SavedRate | null>(null);
	const [lineItems, setLineItems] = useState<LineItem[]>(defaultLineItems);
	const [projectNotes, setProjectNotes] = useState("");
	const [rates, setRates] = useState<RateInfo[]>(savedRates);

	// Use the localStorage hook for saved estimates and templates
	const [savedEstimates, setSavedEstimates] = useLocalStorage<Estimate[]>("saved-estimates", []);
	const [estimateTemplates, setEstimateTemplates] = useLocalStorage<EstimateTemplate[]>("estimate-templates", []);

	// Load saved rates from localStorage if not provided
	useEffect(() => {
		if (savedRates.length === 0) {
			// In a real implementation, we would use getSavedRates()
			const localRates = localStorage.getItem("calculator-state-residential");
			const propertyRates = localStorage.getItem("calculator-state-property-management");
			const singleFamilyRates = localStorage.getItem("calculator-state-single-family");
			const commercialRates = localStorage.getItem("calculator-state-commercial");

			const loadedRates: RateInfo[] = [];

			try {
				if (localRates) {
					const parsed = JSON.parse(localRates);
					loadedRates.push({
						name: parsed.rateName || "Residential",
						type: "residential",
						rate: parseFloat(parsed.recommendedRate) || 150,
					});
				}

				if (propertyRates) {
					const parsed = JSON.parse(propertyRates);
					loadedRates.push({
						name: parsed.rateName || "Property Management",
						type: "property-management",
						rate: parseFloat(parsed.recommendedRate) || 125,
					});
				}

				if (singleFamilyRates) {
					const parsed = JSON.parse(singleFamilyRates);
					loadedRates.push({
						name: parsed.rateName || "Single Family",
						type: "single-family",
						rate: parseFloat(parsed.recommendedRate) || 175,
					});
				}

				if (commercialRates) {
					const parsed = JSON.parse(commercialRates);
					loadedRates.push({
						name: parsed.rateName || "Commercial",
						type: "commercial",
						rate: parseFloat(parsed.recommendedRate) || 200,
					});
				}

				// If no rates were loaded, use defaults
				if (loadedRates.length === 0) {
					setRates(getSavedRates());
				} else {
					setRates(loadedRates);
				}
			} catch (error) {
				console.error("Error loading rates:", error);
				setRates(getSavedRates());
			}
		}
	}, [savedRates]);

	// Select the first rate by default if none selected
	useEffect(() => {
		if (!selectedRate && rates.length > 0) {
			// Convert RateInfo to SavedRate format
			const firstRate: SavedRate = {
				id: `${rates[0].type}-${Date.now()}`,
				name: rates[0].name,
				type: rates[0].type as "residential" | "property-management" | "single-family" | "commercial",
				hourlyRate: rates[0].rate,
				lastUpdated: new Date().toISOString(),
			};
			setSelectedRate(firstRate);
		}
	}, [rates, selectedRate]);

	// Calculate totals
	const totalLaborHours = lineItems.filter((item) => item.type === "labor").reduce((total, item) => total + (item.hours || 0), 0);

	const totalLaborCost = lineItems.filter((item) => item.type === "labor").reduce((total, item) => total + item.totalPrice, 0);

	// For materials, we track both the base cost and marked up cost
	const materialItems = lineItems.filter((item) => item.type === "material");
	const baseMaterialCost = materialItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const totalMaterialCost = materialItems.reduce((total, item) => total + item.totalPrice, 0);

	// Calculate material profit
	const materialProfit = totalMaterialCost - baseMaterialCost;

	const totalEstimate = totalLaborCost + totalMaterialCost;

	// Apply 40% markup to material cost
	const applyMaterialMarkup = (basePrice: number): number => {
		const markupMultiplier = 1.4; // 40% markup
		return basePrice * markupMultiplier;
	};

	// Add new line item
	const addLineItem = (type: "labor" | "material") => {
		const newItem: LineItem = {
			id: crypto.randomUUID(),
			name: "",
			description: "",
			type,
			quantity: 1,
			price: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
			hours: type === "labor" ? 1 : undefined,
			totalPrice: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
		};

		setLineItems([...lineItems, newItem]);
	};

	// Update line item
	const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
		setLineItems(
			lineItems.map((item) => {
				if (item.id === id) {
					const updatedItem = { ...item, [field]: value };

					// Recalculate total price when quantity, price, or hours change
					if (field === "quantity" || field === "price" || field === "hours") {
						if (updatedItem.type === "labor" && updatedItem.hours !== undefined) {
							updatedItem.totalPrice = updatedItem.hours * updatedItem.price;
						} else if (updatedItem.type === "material") {
							// For materials, apply markup to the total
							const baseTotal = updatedItem.quantity * updatedItem.price;
							updatedItem.totalPrice = applyMaterialMarkup(baseTotal);
						}
					}

					return updatedItem;
				}
				return item;
			})
		);
	};

	// Remove line item
	const removeLineItem = (id: string) => {
		setLineItems(lineItems.filter((item) => item.id !== id));
	};

	// Save estimate
	const saveEstimate = () => {
		const estimate: Estimate = {
			id: crypto.randomUUID(),
			projectName,
			clientName,
			clientEmail,
			clientPhone,
			selectedRate,
			lineItems,
			projectNotes,
			totalLaborHours,
			totalLaborCost,
			baseMaterialCost,
			totalMaterialCost,
			materialProfit,
			totalEstimate,
			dateCreated: new Date().toISOString(),
		};

		try {
			// Add to saved estimates using our custom hook
			setSavedEstimates([...savedEstimates, estimate]);
			alert("Estimate saved successfully!");
			// Could redirect here
		} catch (error) {
			console.error("Error saving estimate:", error);
			alert("Error saving estimate. Please try again.");
		}
	};

	// Save as template
	const saveAsTemplate = () => {
		const template: EstimateTemplate = {
			id: crypto.randomUUID(),
			name: projectName || "Unnamed Template",
			lineItems,
			dateCreated: new Date().toISOString(),
		};

		try {
			// Add to saved templates using our custom hook
			setEstimateTemplates([...estimateTemplates, template]);
			alert("Template saved successfully!");
		} catch (error) {
			console.error("Error saving template:", error);
			alert("Error saving template. Please try again.");
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{isTemplate ? `Template: ${templateName}` : "Create New Estimate"}</CardTitle>
					<CardDescription>{isTemplate ? "Modify this template to create a new estimate" : "Build an estimate using your calculated hourly rates"}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="project-name">Project Name</Label>
							<Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
						</div>
						<div>
							<RateSelector
								onRateSelect={(rate) => {
									setSelectedRate(rate);
									// Update all labor line items with the new rate
									if (rate) {
										setLineItems(
											lineItems.map((item) => {
												if (item.type === "labor") {
													const updatedItem = { ...item, price: rate.hourlyRate };
													updatedItem.totalPrice = (item.hours || 1) * rate.hourlyRate;
													return updatedItem;
												}
												return item;
											})
										);
									}
								}}
								selectedRateId={selectedRate?.id}
							/>
						</div>
					</div>

					{!isTemplate && (
						<div className="grid gap-4 md:grid-cols-3">
							<div>
								<Label htmlFor="client-name">Client Name</Label>
								<Input id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" />
							</div>
							<div>
								<Label htmlFor="client-email">Client Email</Label>
								<Input id="client-email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
							</div>
							<div>
								<Label htmlFor="client-phone">Client Phone</Label>
								<Input id="client-phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(555) 555-5555" />
							</div>
						</div>
					)}

					<Tabs defaultValue="labor" className="mt-6">
						<TabsList>
							<TabsTrigger value="labor" className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span>Labor</span>
							</TabsTrigger>
							<TabsTrigger value="materials" className="flex items-center gap-2">
								<ShoppingBag className="h-4 w-4" />
								<span>Materials</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="labor" className="space-y-4 pt-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Labor Items</h3>
								<Button onClick={() => addLineItem("labor")} variant="outline" size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Labor
								</Button>
							</div>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[250px]">Description</TableHead>
											<TableHead>Hours</TableHead>
											<TableHead>Rate</TableHead>
											<TableHead>Total</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{lineItems.filter((item) => item.type === "labor").length === 0 ? (
											<TableRow>
												<TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
													No labor items added yet
												</TableCell>
											</TableRow>
										) : (
											lineItems
												.filter((item) => item.type === "labor")
												.map((item) => (
													<TableRow key={item.id}>
														<TableCell>
															<Input value={item.name} onChange={(e) => updateLineItem(item.id, "name", e.target.value)} placeholder="Labor description" className="border-0 focus-visible:ring-0 p-0" />
														</TableCell>
														<TableCell>
															<Input type="number" min={0.1} step={0.1} value={item.hours || 0} onChange={(e) => updateLineItem(item.id, "hours", parseFloat(e.target.value) || 0)} className="w-20 text-right" />
														</TableCell>
														<TableCell>
															<div className="flex items-center">
																<span className="mr-1">$</span>
																<Input type="number" min={0} step={0.01} value={item.price} onChange={(e) => updateLineItem(item.id, "price", parseFloat(e.target.value) || 0)} className="w-20 text-right" />
															</div>
														</TableCell>
														<TableCell className="font-medium">${item.totalPrice.toFixed(2)}</TableCell>
														<TableCell>
															<Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</TableCell>
													</TableRow>
												))
										)}
									</TableBody>
								</Table>
							</div>

							{lineItems.filter((item) => item.type === "labor").length > 0 && (
								<div className="flex justify-end">
									<div className="bg-muted rounded-md p-3 w-[250px]">
										<div className="flex justify-between text-sm">
											<span>Total Labor Hours:</span>
											<span className="font-medium">{totalLaborHours.toFixed(1)} hrs</span>
										</div>
										<div className="flex justify-between text-sm font-medium mt-1">
											<span>Total Labor Cost:</span>
											<span>${totalLaborCost.toFixed(2)}</span>
										</div>
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value="materials" className="space-y-4 pt-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Material Items</h3>
								<Button onClick={() => addLineItem("material")} variant="outline" size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Material
								</Button>
							</div>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[250px]">Description</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Total</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{lineItems.filter((item) => item.type === "material").length === 0 ? (
											<TableRow>
												<TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
													No material items added yet
												</TableCell>
											</TableRow>
										) : (
											lineItems
												.filter((item) => item.type === "material")
												.map((item) => (
													<TableRow key={item.id}>
														<TableCell>
															<div className="flex items-center space-x-2">
																<ShoppingBag className="h-4 w-4 text-amber-500" />
																<span>Material</span>
															</div>
														</TableCell>
														<TableCell>
															<Input value={item.name} onChange={(e) => updateLineItem(item.id, "name", e.target.value)} />
														</TableCell>
														<TableCell>
															<Input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} />
														</TableCell>
														<TableCell>
															<Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)} />
														</TableCell>
														<TableCell>-</TableCell>
														<TableCell>
															<div className="flex items-center">
																<span className="mr-1">$</span>
																<Input type="number" min="0.01" step="0.01" value={item.price} onChange={(e) => updateLineItem(item.id, "price", parseFloat(e.target.value) || 0)} title={item.type === "material" ? "Base cost before markup" : ""} />
															</div>
														</TableCell>
														<TableCell>
															{item.type === "material" ? (
																<div className="flex flex-col">
																	<span className="font-medium">${item.totalPrice.toFixed(2)}</span>
																	{item.price > 0 && <span className="text-xs text-muted-foreground">(Base: ${(item.price * item.quantity).toFixed(2)})</span>}
																</div>
															) : (
																<span className="font-medium">${item.totalPrice.toFixed(2)}</span>
															)}
														</TableCell>
														<TableCell>
															<Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</TableCell>
													</TableRow>
												))
										)}
									</TableBody>
								</Table>
							</div>

							{lineItems.filter((item) => item.type === "material").length > 0 && (
								<div className="flex justify-end">
									<div className="bg-muted rounded-md p-3 w-[250px]">
										<div className="flex justify-between text-sm font-medium">
											<span>Total Material Cost:</span>
											<span>${totalMaterialCost.toFixed(2)}</span>
										</div>
									</div>
								</div>
							)}
						</TabsContent>
					</Tabs>

					<div className="mt-6 border-t pt-4">
						<div className="flex justify-between items-start">
							<div className="w-1/2">
								<Label htmlFor="project-notes">Project Notes</Label>
								<textarea id="project-notes" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder="Add any additional notes about this project" className="w-full min-h-[100px] p-2 border rounded-md"></textarea>
							</div>

							<div className="bg-muted rounded-md p-4 w-[300px]">
								<h3 className="font-medium mb-2">Estimate Summary</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span>Labor:</span>
										<span>${totalLaborCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>Base Material Cost:</span>
										<span>${baseMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>Material Markup (40%):</span>
										<span>${materialProfit.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>Total Material Cost:</span>
										<span>${totalMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between font-medium text-base pt-2 border-t">
										<span>Total Estimate:</span>
										<span>${totalEstimate.toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<Button variant="outline" onClick={saveAsTemplate}>
							<FilePlus2 className="h-4 w-4 mr-2" />
							Save as Template
						</Button>
						<Button onClick={saveEstimate}>
							<File className="h-4 w-4 mr-2" />
							Save Estimate
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
