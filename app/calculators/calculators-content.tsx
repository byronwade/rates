"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Building2, Warehouse, ReceiptText, Info, PiggyBank } from "lucide-react";
import { Suspense } from "react";
import { RateMetadataItem } from "@/config/rates";
import { ServiceType } from "@/components/rate-calculators";
import { CalculatorCard } from "./calculator-card";
import { CardSkeleton } from "./card-skeleton";

// Map service types to icons
const serviceIconMap: Record<ServiceType, React.ReactNode> = {
	residential: <Home className="h-5 w-5 text-blue-500" />,
	commercial: <Warehouse className="h-5 w-5 text-green-600" />,
	"property-management": <Building2 className="h-5 w-5 text-purple-500" />,
	septic: <ReceiptText className="h-5 w-5 text-amber-600" />,
	"single-family": <Home className="h-5 w-5 text-slate-500" />,
};

export function CalculatorsContent({ metadata }: { metadata: RateMetadataItem[] }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
			{metadata.map((calculator) => (
				<Suspense key={calculator.id} fallback={<CardSkeleton />}>
					<CalculatorCard icon={serviceIconMap[calculator.serviceType as ServiceType] || <Info className="h-5 w-5" />} title={calculator.name} description={calculator.description} href={`/calculators/${calculator.id}`} category={calculator.category} />
				</Suspense>
			))}

			{/* Analysis and Comparison Cards */}
			<Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
				<CardHeader className="pb-2 sm:pb-4">
					<div className="flex items-center gap-2">
						<PiggyBank className="h-5 w-5 text-blue-600" />
						<CardTitle className="text-lg sm:text-xl">Rate Comparisons</CardTitle>
					</div>
					<CardDescription className="text-xs sm:text-sm">Compare calculated rates</CardDescription>
				</CardHeader>
				<CardContent className="pb-2 sm:pb-4 flex-grow">
					<p className="text-xs sm:text-sm">Visualize and compare rates across different calculator types to evaluate pricing strategies.</p>
				</CardContent>
				<CardFooter className="pt-0">
					<Button asChild className="w-full text-sm sm:text-base">
						<Link href="/calculators/comparison">View Comparisons</Link>
					</Button>
				</CardFooter>
			</Card>

			<Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
				<CardHeader className="pb-2 sm:pb-4">
					<div className="flex items-center gap-2">
						<Info className="h-5 w-5 text-indigo-500" />
						<CardTitle className="text-lg sm:text-xl">Rate Analysis</CardTitle>
					</div>
					<CardDescription className="text-xs sm:text-sm">Analyze profit margins and sustainability</CardDescription>
				</CardHeader>
				<CardContent className="pb-2 sm:pb-4 flex-grow">
					<p className="text-xs sm:text-sm">Get insights into your rate&apos;s competitive positioning and profitability with detailed analysis.</p>
				</CardContent>
				<CardFooter className="pt-0">
					<Button asChild className="w-full text-sm sm:text-base">
						<Link href="/calculators/analysis">View Analysis</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
