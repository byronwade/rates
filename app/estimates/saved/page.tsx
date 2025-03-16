"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2, Copy, Eye, Home, Building2, Droplets, Flame, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageLayout } from "@/components/layout/page-layout";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount || 0);
};

interface SavedEstimate {
	id: string;
	projectName: string;
	template: string;
	customerName?: string;
	totalPrice: number;
	createdAt: string;
	[key: string]: unknown;
}

export default function SavedEstimatesPage() {
	const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load saved estimates from localStorage
	useEffect(() => {
		setIsLoading(true);
		try {
			const estimates = localStorage.getItem("saved-estimates");
			if (estimates) {
				setSavedEstimates(JSON.parse(estimates));
			}
		} catch (error) {
			console.error("Error loading saved estimates:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Delete an estimate
	const deleteEstimate = (id: string) => {
		const updatedEstimates = savedEstimates.filter((estimate) => estimate.id !== id);
		setSavedEstimates(updatedEstimates);
		localStorage.setItem("saved-estimates", JSON.stringify(updatedEstimates));
	};

	// Duplicate an estimate
	const duplicateEstimate = (estimate: SavedEstimate) => {
		const newEstimate = {
			...estimate,
			id: crypto.randomUUID(),
			projectName: `${estimate.projectName} (Copy)`,
			createdAt: new Date().toISOString(),
		};
		const updatedEstimates = [...savedEstimates, newEstimate];
		setSavedEstimates(updatedEstimates);
		localStorage.setItem("saved-estimates", JSON.stringify(updatedEstimates));
	};

	return (
		<PageLayout title="Saved Estimates" description="View and manage your saved estimates">
			{savedEstimates.length === 0 && !isLoading ? (
				<div className="text-center py-12">
					<ReceiptText className="mx-auto h-12 w-12 text-muted-foreground" />
					<h2 className="mt-4 text-lg font-semibold">No saved estimates</h2>
					<p className="mt-2 text-sm text-muted-foreground">Create a new estimate to get started</p>
					<Button asChild className="mt-4">
						<Link href="/estimates/new">Create New Estimate</Link>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{savedEstimates.map((estimate) => (
						<Suspense key={estimate.id} fallback={<EstimateCardSkeleton />}>
							<EstimateCard id={estimate.id} projectName={estimate.projectName} templateType={estimate.template} customerName={estimate.customerName} total={estimate.totalPrice} date={new Date(estimate.createdAt).toLocaleDateString()} onDelete={() => deleteEstimate(estimate.id)} onDuplicate={() => duplicateEstimate(estimate)} />
						</Suspense>
					))}
				</div>
			)}
		</PageLayout>
	);
}

interface EstimateCardProps {
	id: string;
	projectName: string;
	templateType: string;
	customerName?: string;
	total: number;
	date: string;
	onDelete: () => void;
	onDuplicate: () => void;
}

function EstimateCard({ id, projectName, templateType, customerName, total, date, onDelete, onDuplicate }: EstimateCardProps) {
	const icon = (() => {
		switch (templateType) {
			case "residential":
				return <Home className="h-5 w-5 text-blue-500" />;
			case "property-management":
				return <Building2 className="h-5 w-5 text-green-600" />;
			case "tankless-water-heater":
				return <Flame className="h-5 w-5 text-orange-500" />;
			case "standard-water-heater":
				return <Droplets className="h-5 w-5 text-blue-500" />;
			case "enhanced-septic-system":
			case "enviroserver-es-series":
				return <ReceiptText className="h-5 w-5 text-green-600" />;
			default:
				return <FilePenLine className="h-5 w-5 text-gray-500" />;
		}
	})();

	// Get readable template name
	const getTemplateDisplayName = (type: string) => {
		switch (type) {
			case "residential":
				return "Residential";
			case "property-management":
				return "Property Management";
			case "tankless-water-heater":
				return "Tankless Water Heater";
			case "standard-water-heater":
				return "Standard Water Heater";
			case "enhanced-septic-system":
				return "Enhanced Septic System";
			case "enviroserver-es-series":
				return "EnviroServer ES Series";
			default:
				return "Custom Estimate";
		}
	};

	return (
		<Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
			<CardHeader className="pb-2 sm:pb-4">
				<div className="flex items-center gap-2">
					{icon}
					<CardTitle className="text-lg sm:text-xl">{projectName}</CardTitle>
				</div>
				<CardDescription className="text-xs sm:text-sm">
					{templateType && <span className="block">{getTemplateDisplayName(templateType)}</span>}
					{customerName && <span className="block">Customer: {customerName}</span>}
					<span className="block">Created: {date}</span>
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-2 sm:pb-4 flex-grow">
				<div className="flex justify-between font-medium">
					<span>Total:</span>
					<span>{formatCurrency(total)}</span>
				</div>
			</CardContent>
			<CardFooter className="pt-0 flex justify-between">
				<Button variant="outline" size="sm" asChild>
					<Link href={`/estimates/view/${id}`}>
						<Eye className="h-4 w-4 mr-1" />
						View
					</Link>
				</Button>
				<div className="flex space-x-1">
					<Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
						<Copy className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" onClick={onDelete} title="Delete">
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}

function EstimateCardSkeleton() {
	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="pb-2 sm:pb-4">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
					<div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
				</div>
				<div className="h-4 bg-muted rounded w-3/4 mt-2 animate-pulse" />
				<div className="h-3 bg-muted rounded w-1/2 mt-1 animate-pulse" />
			</CardHeader>
			<CardContent className="pb-2 sm:pb-4 flex-grow">
				<div className="h-5 bg-muted rounded w-full animate-pulse" />
			</CardContent>
			<CardFooter className="pt-0">
				<div className="flex justify-between w-full">
					<div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
					<div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
				</div>
			</CardFooter>
		</Card>
	);
}
