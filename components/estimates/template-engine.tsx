"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Calculator, Clock, Package, SaveIcon, Share, Copy, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RateSelector, { SavedRate } from "./rate-selector";
import { LineItem } from "./estimate-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Enhanced LineItem interface with additional properties
export interface EnhancedLineItem extends LineItem {
	category?: string;
	wastage?: number; // Wastage percentage for material items
}

// Category configuration interface
export interface CategoryConfig {
	id: string;
	name: string;
	icon: React.ComponentType;
	color?: string;
	shortName?: string; // For mobile/smaller screens
}

// Template configuration interface
export interface EstimateTemplateConfig {
	id: string;
	name: string;
	icon: React.ComponentType;
	description: string;
	defaultProjectName: string;
	defaultMaterialMarkup: number;
	categories: CategoryConfig[];
	defaultLineItems: (hourlyRate: number) => EnhancedLineItem[];
	summaryFields?: string[];
}

// Helper function to generate a UUID
const generateUUID = (): string => {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback implementation
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Update the component props to accept preloadedConfig
interface TemplateEngineProps {
	estimateId: string;
	preloadedConfig?: EstimateTemplateConfig;
}

// Helper function to safely render icon components with className
const IconRenderer = ({ IconComponent, className }: { IconComponent: React.ComponentType<{ className?: string }>; className?: string }) => {
	if (!IconComponent) return null;
	return <IconComponent className={className} />;
};

export default function EstimateTemplateEngine({ estimateId, preloadedConfig }: TemplateEngineProps) {
	// State for loading the template configuration
	const [config, setConfig] = useState<EstimateTemplateConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// State for the estimate
	const [projectName, setProjectName] = useState("");
	const [selectedRate, setSelectedRate] = useState<SavedRate | null>(null);
	const [lineItems, setLineItems] = useState<EnhancedLineItem[]>([]);
	const [materialMarkup, setMaterialMarkup] = useState(40); // Default 40% markup
	const [activeTab, setActiveTab] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);

	// Use preloaded config if available, otherwise load normally
	useEffect(() => {
		const loadConfig = async () => {
			setLoading(true);
			try {
				if (preloadedConfig) {
					// Use the preloaded config if provided
					setConfig(preloadedConfig);
					setProjectName(preloadedConfig.defaultProjectName);
					setMaterialMarkup(preloadedConfig.defaultMaterialMarkup);
					if (preloadedConfig.categories.length > 0) {
						setActiveTab(preloadedConfig.categories[0].id);
					}
				} else {
					// Fall back to dynamic import without using unstable_cache
					try {
						const templateModule = await import(`@/config/estimates/${estimateId}.ts`);
						const importedConfig = templateModule.default as EstimateTemplateConfig;
						setConfig(importedConfig);
						setProjectName(importedConfig.defaultProjectName);
						setMaterialMarkup(importedConfig.defaultMaterialMarkup);
						if (importedConfig.categories.length > 0) {
							setActiveTab(importedConfig.categories[0].id);
						}
					} catch (importError) {
						console.error(`Failed to load template config for ${estimateId}:`, importError);
						setError(`Template configuration for ${estimateId} not found`);
					}
				}
			} catch (error) {
				console.error(`Error loading template ${estimateId}:`, error);
				setError(`Failed to load template: ${error instanceof Error ? error.message : String(error)}`);
			} finally {
				setLoading(false);
			}
		};

		loadConfig();
	}, [estimateId, preloadedConfig]);

	// Apply markup to material cost - wrapped in useCallback to prevent recreation on every render
	const applyMaterialMarkup = useCallback(
		(basePrice: number, markup: number = materialMarkup, wastage: number = 0): number => {
			// First add wastage to the base price
			const priceWithWastage = basePrice * (1 + wastage / 100);
			// Then apply markup
			const markupMultiplier = 1 + markup / 100;
			return priceWithWastage * markupMultiplier;
		},
		[materialMarkup]
	);

	// Initialize line items when a rate is selected
	useEffect(() => {
		if (selectedRate && config) {
			const initialLineItems = config.defaultLineItems(selectedRate.hourlyRate);

			// Apply markup to material items
			const itemsWithMarkup = initialLineItems.map((item) => {
				if (item.type === "material") {
					return {
						...item,
						totalPrice: applyMaterialMarkup(item.price * item.quantity, materialMarkup, item.wastage || 0),
					};
				}
				return item;
			});

			setLineItems(itemsWithMarkup);
		}
	}, [selectedRate, config, materialMarkup, applyMaterialMarkup]);

	// Update material markup and recalculate totals
	const updateMaterialMarkup = (newMarkup: number) => {
		setMaterialMarkup(newMarkup);

		// Update material prices with new markup
		const updatedItems = lineItems.map((item) => {
			if (item.type === "material") {
				return {
					...item,
					totalPrice: applyMaterialMarkup(item.price * item.quantity, newMarkup, item.wastage || 0),
				};
			}
			return item;
		});

		setLineItems(updatedItems);
	};

	// Add a new line item
	const addLineItem = (type: "labor" | "material", category: string) => {
		const newItem: EnhancedLineItem = {
			id: generateUUID(),
			name: type === "labor" ? "Labor Item" : "Material Item",
			description: "",
			type,
			category,
			quantity: 1,
			hours: type === "labor" ? 1 : undefined,
			price: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
			totalPrice: type === "labor" ? selectedRate?.hourlyRate || 0 : 0,
			wastage: type === "material" ? 10 : undefined, // Default 10% wastage for materials
		};

		setLineItems([...lineItems, newItem]);
	};

	// Remove a line item
	const removeLineItem = (id: string) => {
		setLineItems(lineItems.filter((item) => item.id !== id));
	};

	// Update a line item
	const updateLineItem = (id: string, field: keyof EnhancedLineItem, value: string | number) => {
		const updatedItems = lineItems.map((item) => {
			if (item.id === id) {
				const updatedItem = { ...item, [field]: value };

				// Recalculate total if quantity, price, hours, or wastage changes
				if (field === "quantity" || field === "price" || field === "hours" || field === "wastage") {
					if (item.type === "labor" && updatedItem.hours) {
						updatedItem.totalPrice = Number(updatedItem.hours) * Number(updatedItem.price);
					} else if (item.type === "material") {
						// For materials, apply markup and wastage to the total
						const baseTotal = Number(updatedItem.quantity) * Number(updatedItem.price);
						updatedItem.totalPrice = applyMaterialMarkup(baseTotal, materialMarkup, updatedItem.wastage || 0);
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

	// Save the estimate
	const saveEstimate = () => {
		// Get existing saved estimates or initialize empty array
		const savedEstimates = JSON.parse(localStorage.getItem("saved-estimates") || "[]");

		const newEstimate = {
			id: generateUUID(),
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
			template: estimateId,
		};

		// Add to saved estimates
		savedEstimates.push(newEstimate);
		localStorage.setItem("saved-estimates", JSON.stringify(savedEstimates));

		// Show confirmation
		alert("Estimate saved successfully!");
	};

	// Copy estimate to clipboard
	const copyEstimateToClipboard = async () => {
		try {
			const estimateText = generateEstimateText();
			await navigator.clipboard.writeText(estimateText);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy: ", err);
			alert("Failed to copy estimate to clipboard");
		}
	};

	// Generate text version of estimate for clipboard
	const generateEstimateText = () => {
		let text = `${projectName}\n\n`;

		// Group items by category
		const categorizedItems = lineItems.reduce<Record<string, EnhancedLineItem[]>>((acc, item) => {
			const category = item.category || "uncategorized";
			if (!acc[category]) acc[category] = [];
			acc[category].push(item);
			return acc;
		}, {});

		// Add items by category
		Object.entries(categorizedItems).forEach(([category, items]) => {
			const categoryConfig = config?.categories.find((c) => c.id === category);
			text += `${categoryConfig?.name || category.toUpperCase()}\n`;
			text += "--------------------\n";

			items.forEach((item) => {
				const itemTotal = item.totalPrice.toFixed(2);
				text += `${item.name}: $${itemTotal}\n`;
				if (item.description) text += `  ${item.description}\n`;
			});

			text += "\n";
		});

		// Add summary
		text += "SUMMARY\n";
		text += "--------------------\n";
		text += `Total Labor Hours: ${totalLaborHours} hrs\n`;
		text += `Total Labor Cost: $${totalLaborCost.toFixed(2)}\n`;
		text += `Material Cost (with ${materialMarkup}% markup): $${totalMaterialCost.toFixed(2)}\n`;
		text += `Material Profit: $${materialProfit.toFixed(2)}\n`;
		text += `TOTAL ESTIMATE: $${totalEstimate.toFixed(2)}\n`;

		return text;
	};

	// Share estimate
	const shareEstimate = async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: projectName,
					text: generateEstimateText(),
				});
			} else {
				alert("Web Share API not supported in your browser. Copy to clipboard instead.");
				copyEstimateToClipboard();
			}
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	// Calculate totals
	const getCategoryItems = (category: string) => {
		return lineItems.filter((item) => item.category === category);
	};

	const totalLaborHours = lineItems.filter((item) => item.type === "labor").reduce((sum, item) => sum + (item.hours || 0), 0);

	const totalLaborCost = lineItems.filter((item) => item.type === "labor").reduce((sum, item) => sum + item.totalPrice, 0);

	const materialItems = lineItems.filter((item) => item.type === "material");

	const baseMaterialCost = materialItems.reduce((sum, item) => {
		// If wastage is defined, we need to account for it in the base cost calculation
		const baseQuantityCost = item.price * item.quantity;
		return sum + baseQuantityCost;
	}, 0);

	const totalMaterialCost = materialItems.reduce((sum, item) => sum + item.totalPrice, 0);

	const materialProfit = totalMaterialCost - baseMaterialCost;
	const totalEstimate = totalLaborCost + totalMaterialCost;

	// If still loading or error occurred
	if (loading) {
		return <div className="animate-pulse h-screen w-full bg-muted/20"></div>;
	}

	if (error || !config) {
		return (
			<div className="p-6 border rounded-lg space-y-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
					<div className="mr-4 mb-3 sm:mb-0">
						<Calculator className="h-8 w-8 text-destructive" />
					</div>
					<div>
						<h1 className="text-xl sm:text-2xl font-bold">Error Loading Template</h1>
						<p className="text-sm text-muted-foreground">{error || "Template configuration not found"}</p>
					</div>
				</div>
			</div>
		);
	}

	// Render template with the loaded configuration
	return (
		<div className="space-y-6">
			<div className="p-6 border-b">
				<div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
					<div className="mr-4 mb-3 sm:mb-0">{config.icon && <IconRenderer IconComponent={config.icon} className="h-8 w-8 text-green-600" />}</div>
					<div>
						<h1 className="text-xl sm:text-2xl font-bold">{config.name}</h1>
						<p className="text-sm text-muted-foreground">{config.description}</p>
					</div>
				</div>
				<div className="space-y-4">
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
							<p className="text-xs text-muted-foreground mt-1">Applied to all material items (materials, electrical, construction, and subcontractor materials)</p>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Estimate Categories</h3>

						{config.categories.length > 0 && (
							<Tabs defaultValue={config.categories[0].id} value={activeTab} onValueChange={setActiveTab}>
								<div className="relative mb-2">
									<div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
										<TabsList className="w-max min-w-full px-0.5 py-1">
											{config.categories.map((category) => (
												<TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 min-w-[75px]">
													<IconRenderer IconComponent={category.icon} className="h-4 w-4 flex-shrink-0" />
													<span className="hidden sm:inline truncate">{category.name}</span>
													<span className="sm:hidden truncate">{category.shortName || category.name}</span>
												</TabsTrigger>
											))}
										</TabsList>
									</div>
									<div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none sm:hidden"></div>
									<div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden"></div>
								</div>
								<p className="text-xs text-muted-foreground text-center sm:hidden mb-2">⟷ Swipe to see all categories</p>

								{config.categories.map((category) => (
									<TabsContent key={category.id} value={category.id} className="space-y-4">
										<div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
											<h4 className="font-medium flex items-center gap-2">
												<IconRenderer IconComponent={category.icon} className="h-4 w-4" />
												{category.name} Items
												{category.id !== "labor" && <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">({materialMarkup}% markup on materials)</span>}
											</h4>
											<div className="flex flex-wrap gap-2">
												{category.id === "labor" ? (
													<Button variant="outline" size="sm" onClick={() => addLineItem("labor", category.id)} disabled={!selectedRate} className="w-full sm:w-auto">
														<IconRenderer IconComponent={Clock} className="h-4 w-4 mr-1 sm:hidden" /> Add Labor
													</Button>
												) : (
													<>
														<Button variant="outline" size="sm" onClick={() => addLineItem("labor", category.id)} disabled={!selectedRate} className="flex-1 sm:flex-none">
															<IconRenderer IconComponent={Clock} className="h-4 w-4 mr-1 sm:hidden" /> Add Labor
														</Button>
														<Button variant="outline" size="sm" onClick={() => addLineItem("material", category.id)} className="flex-1 sm:flex-none">
															<IconRenderer IconComponent={Package} className="h-4 w-4 mr-1 sm:hidden" /> Add Material
														</Button>
													</>
												)}
											</div>
										</div>
										{category.id !== "labor" && <p className="text-xs text-muted-foreground mt-1 sm:hidden">({materialMarkup}% markup on materials)</p>}

										{getCategoryItems(category.id).length > 0 ? (
											<div className="overflow-x-auto relative border rounded-md">
												<Table className="w-full min-w-[700px]">
													<TableHeader>
														<TableRow>
															<TableHead className="text-left w-1/4 md:w-auto">Name</TableHead>
															<TableHead className="text-left whitespace-nowrap">Type</TableHead>
															<TableHead className="text-left whitespace-nowrap">Qty</TableHead>
															<TableHead className="text-left whitespace-nowrap">Hours</TableHead>
															<TableHead className="text-left whitespace-nowrap">Rate</TableHead>
															{category.id !== "labor" && <TableHead className="text-left whitespace-nowrap">Wastage %</TableHead>}
															<TableHead className="text-left whitespace-nowrap">Total</TableHead>
															<TableHead className="w-10"></TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{getCategoryItems(category.id).map((item) => {
															// Helper function to get color class based on category
															const getCategoryColorClass = (categoryId: string) => {
																switch (categoryId) {
																	case "labor":
																		return "bg-blue-100 text-blue-800";
																	case "materials":
																		return "bg-amber-100 text-amber-800";
																	case "electrical":
																		return "bg-yellow-100 text-yellow-800";
																	case "constructionMaterials":
																		return "bg-stone-100 text-stone-800";
																	case "subcontractor":
																		return "bg-purple-100 text-purple-800";
																	default:
																		return "bg-gray-100 text-gray-800";
																}
															};

															return (
																<TableRow key={item.id}>
																	<TableCell>
																		<div className="space-y-1">
																			<Input value={item.name} onChange={(e) => updateLineItem(item.id, "name", e.target.value)} className="font-medium w-full" />
																			<Input value={item.description || ""} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Description" className="text-sm w-full" />
																		</div>
																	</TableCell>
																	<TableCell>
																		<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.type === "labor" ? "bg-blue-100 text-blue-800" : getCategoryColorClass(category.id)}`}>
																			{item.type === "labor" ? (
																				<>
																					<IconRenderer IconComponent={Clock} className="mr-1 h-3 w-3" />
																					Labor
																				</>
																			) : (
																				<>
																					<IconRenderer IconComponent={category.icon} className="mr-1 h-3 w-3" />
																					{category.shortName || category.name}
																				</>
																			)}
																		</span>
																	</TableCell>
																	<TableCell className="text-left whitespace-nowrap">
																		<Input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} className="w-16 text-left" inputMode="numeric" />
																	</TableCell>
																	<TableCell className="text-left whitespace-nowrap">{item.type === "labor" ? <Input type="number" min="0.25" step="0.25" value={item.hours} onChange={(e) => updateLineItem(item.id, "hours", Number(e.target.value))} className="w-16 text-left" inputMode="numeric" /> : "—"}</TableCell>
																	<TableCell className="text-left whitespace-nowrap">
																		<div className="flex items-center justify-start">
																			<span className="mr-1">$</span>
																			{item.type === "material" ? (
																				<TooltipProvider>
																					<Tooltip>
																						<TooltipTrigger asChild>
																							<Input type="number" min="0" value={item.price} onChange={(e) => updateLineItem(item.id, "price", Number(e.target.value))} className="w-20 text-left" inputMode="decimal" />
																						</TooltipTrigger>
																						<TooltipContent side="left">
																							<p className="text-xs">Base price before markup</p>
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>
																			) : (
																				<Input type="number" min="0" value={item.price} onChange={(e) => updateLineItem(item.id, "price", Number(e.target.value))} className="w-20 text-left" inputMode="decimal" />
																			)}
																		</div>
																	</TableCell>
																	{category.id !== "labor" && <TableCell className="text-left whitespace-nowrap">{item.type === "material" && category.id !== "subcontractor" ? <Input type="number" min="0" max="50" value={item.wastage || 10} onChange={(e) => updateLineItem(item.id, "wastage", Number(e.target.value))} className="w-16 text-left" inputMode="decimal" /> : "—"}</TableCell>}
																	<TableCell className="text-left whitespace-nowrap font-medium">
																		{item.type === "material" ? (
																			<TooltipProvider>
																				<Tooltip>
																					<TooltipTrigger asChild>
																						<span className="cursor-help">${item.totalPrice.toFixed(2)}</span>
																					</TooltipTrigger>
																					<TooltipContent side="left">
																						<div className="text-xs space-y-1">
																							<p>Base: ${(item.price * item.quantity).toFixed(2)}</p>
																							{item.category !== "subcontractor" && (
																								<>
																									<p>Wastage: {item.wastage || 10}%</p>
																									<p>With Wastage: ${(item.price * item.quantity * (1 + (item.wastage || 10) / 100)).toFixed(2)}</p>
																								</>
																							)}
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
																	<TableCell className="text-center">
																		<Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
																			<Trash2 className="h-4 w-4 text-muted-foreground" />
																		</Button>
																	</TableCell>
																</TableRow>
															);
														})}
													</TableBody>
												</Table>
											</div>
										) : (
											<div className="border rounded-lg p-8 text-center">
												<p className="text-muted-foreground">No {category.name.toLowerCase()} items added yet. Add items using the buttons above.</p>
											</div>
										)}

										<div className="mt-2 p-2 bg-muted/30 rounded-md">
											<p className="text-sm text-right">
												Category Total:{" "}
												<span className="font-medium">
													$
													{getCategoryItems(category.id)
														.reduce((sum, item) => sum + item.totalPrice, 0)
														.toFixed(2)}
												</span>
												{category.id !== "labor" && getCategoryItems(category.id).filter((item) => item.type === "material").length > 0 && <span className="text-xs text-muted-foreground ml-2">(includes markup profit)</span>}
											</p>
										</div>

										<div className="overflow-x-auto md:hidden">
											<p className="text-xs text-muted-foreground mb-2">Scroll horizontally to view all columns</p>
										</div>
									</TabsContent>
								))}
							</Tabs>
						)}
					</div>

					<Separator className="my-4" />

					<div className="border rounded-lg p-6 bg-muted/50 space-y-4">
						<h3 className="text-lg font-medium flex items-center border-b pb-2">
							<Calculator className="mr-2 h-5 w-5" />
							Project Profitability Analysis
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-3">
								<h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Labor Metrics</h4>
								<div className="space-y-2 bg-white/50 p-3 rounded-md border">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Total Labor Hours:</span>
										<span className="font-medium">{totalLaborHours} hrs</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Total Labor Cost:</span>
										<span className="font-medium">${totalLaborCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Avg. Cost Per Hour:</span>
										<span className="font-medium">${(totalLaborHours > 0 ? totalLaborCost / totalLaborHours : 0).toFixed(2)}/hr</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Labor % of Total:</span>
										<span className="font-medium">{(totalEstimate > 0 ? (totalLaborCost / totalEstimate) * 100 : 0).toFixed(1)}%</span>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Materials Profit Analysis</h4>
								<div className="space-y-2 bg-white/50 p-3 rounded-md border">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Base Materials Cost:</span>
										<span className="font-medium">${baseMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">With {materialMarkup}% Markup:</span>
										<span className="font-medium">${totalMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-green-600">
										<span>Material Profit:</span>
										<span className="font-medium">${materialProfit.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Materials % of Total:</span>
										<span className="font-medium">{(totalEstimate > 0 ? (totalMaterialCost / totalEstimate) * 100 : 0).toFixed(1)}%</span>
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
							<div className="space-y-2 bg-white/50 p-3 rounded-md border col-span-2">
								<h4 className="font-medium text-sm">Profit Summary</h4>
								<div className="space-y-1">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Labor Revenue:</span>
										<span className="font-medium">${totalLaborCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Material Revenue:</span>
										<span className="font-medium">${totalMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Material Cost:</span>
										<span className="font-medium text-red-500">-${baseMaterialCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-green-600 pt-1 border-t">
										<span className="font-medium">Project Profit:</span>
										<span className="font-medium">${(totalLaborCost + materialProfit).toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-green-600">
										<span>Profit Margin:</span>
										<span className="font-medium">{(totalEstimate > 0 ? ((totalLaborCost + materialProfit) / totalEstimate) * 100 : 0).toFixed(1)}%</span>
									</div>
								</div>
							</div>

							<div className="space-y-2 bg-blue-50 p-3 rounded-md border">
								<h4 className="font-medium text-sm text-blue-800">Total Project</h4>
								<div className="flex flex-col gap-1">
									<div className="flex justify-between items-center">
										<span className="text-blue-700 text-sm">Project Total:</span>
										<span className="text-blue-800 text-2xl font-bold">${totalEstimate.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm text-blue-700">
										<span>Labor Component:</span>
										<span>${totalLaborCost.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-sm text-blue-700">
										<span>Materials Component:</span>
										<span>${totalMaterialCost.toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="pt-4 mt-2 border-t text-sm text-muted-foreground space-y-1">
							<p>
								<strong>Note:</strong> Quote valid for 30 days. Pricing reflects a 3.5% cash discount.
							</p>
							<p>Labor costs do not include potential overtime or emergency rates which may apply.</p>
						</div>
					</div>

					<div className="pt-4 border-t">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
							<Button className="w-full" onClick={saveEstimate} disabled={!selectedRate || lineItems.length === 0}>
								<SaveIcon className="mr-2 h-4 w-4" />
								Save Estimate
							</Button>
							<Button variant="outline" className="w-full" onClick={copyEstimateToClipboard}>
								{copySuccess ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
								{copySuccess ? "Copied!" : "Copy Summary"}
							</Button>
							<Button variant="outline" className="w-full" onClick={shareEstimate}>
								<Share className="mr-2 h-4 w-4" />
								Share
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
