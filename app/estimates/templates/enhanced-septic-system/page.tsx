"use client";

import EnhancedSepticSystemTemplate from "@/components/estimates/templates/enhanced-septic-system";
import { SubNavBar } from "@/components/ui/nav-bar";
import { FilePlus2, Droplets, Flame, ReceiptText } from "lucide-react";

export default function EnhancedSepticSystemTemplatePage() {
	const estimateLinks = [
		{
			title: "New Estimate",
			href: "/estimates/new",
			icon: <FilePlus2 className="h-4 w-4" />,
		},
		{
			title: "Tankless Water Heater",
			href: "/estimates/templates/tankless-water-heater",
			icon: <Flame className="h-4 w-4" />,
		},
		{
			title: "Standard Water Heater",
			href: "/estimates/templates/standard-water-heater",
			icon: <Droplets className="h-4 w-4" />,
		},
		{
			title: "Enhanced Septic System",
			href: "/estimates/templates/enhanced-septic-system",
			icon: <ReceiptText className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SubNavBar links={estimateLinks} />
			<div className="container py-6 mx-auto">
				<h1 className="text-3xl font-bold mb-6">Enhanced Septic System Template</h1>
				<EnhancedSepticSystemTemplate />
			</div>
		</>
	);
}
