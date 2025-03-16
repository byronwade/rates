import { Suspense } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { getRateMetadata } from "@/config/rates";
import { CalculatorsContent } from "./calculators-content";
import { CardSkeleton } from "./card-skeleton";

// Server Component to fetch metadata
async function fetchRateMetadata() {
	return await getRateMetadata();
}

// Main page component
export default async function CalculatorsPage() {
	// Fetch metadata on the server
	const metadata = await fetchRateMetadata();

	return (
		<PageLayout title="Rate Calculators" description="Calculate optimal hourly rates for your business">
			<Suspense
				fallback={
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
						{Array(6)
							.fill(0)
							.map((_, i) => (
								<CardSkeleton key={i} />
							))}
					</div>
				}
			>
				<CalculatorsContent metadata={metadata} />
			</Suspense>
		</PageLayout>
	);
}
