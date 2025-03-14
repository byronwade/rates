import EstimateForm from "@/components/estimates/estimate-form";
import { SubNavBar } from "@/components/ui/nav-bar";
import { FilePlus2, FileText } from "lucide-react";

export default function NewEstimatePage() {
	const estimateLinks = [
		{
			title: "New Estimate",
			href: "/estimates/new",
			icon: <FilePlus2 className="h-4 w-4" />,
		},
		{
			title: "Tankless Water Heater",
			href: "/estimates/templates/tankless-water-heater",
			icon: <FileText className="h-4 w-4" />,
		},
		{
			title: "Standard Water Heater",
			href: "/estimates/templates/standard-water-heater",
			icon: <FileText className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SubNavBar links={estimateLinks} />

			<div className="py-6">
				<h1 className="text-3xl font-bold mb-6">Create New Estimate</h1>

				<EstimateForm savedRates={[]} defaultProjectName="" defaultLineItems={[]} />
			</div>
		</>
	);
}
