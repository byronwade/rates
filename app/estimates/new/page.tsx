"use client";

import EstimateForm from "@/components/estimates/estimate-form";
import { Suspense } from "react";
import { TemplatePageLayout } from "@/components/layout/template-page-layout";

export default function NewEstimatePage() {
	return (
		<TemplatePageLayout>
			<Suspense fallback={<div className="animate-pulse h-screen w-full bg-muted/20"></div>}>
				<EstimateForm savedRates={[]} defaultProjectName="" defaultLineItems={[]} />
			</Suspense>
		</TemplatePageLayout>
	);
}
