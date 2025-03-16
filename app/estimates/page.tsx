import Link from "next/link";
import { Suspense } from "react";
import { TemplatePageLayout } from "@/components/layout/template-page-layout";
import { getTemplateMetadata } from "@/config/estimates";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, Calculator, Package, Droplets, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Map template types to icons
const templateIconMap: Record<string, React.ReactNode> = {
	septic: <Package className="h-5 w-5 text-amber-600" />,
	plumbing: <Droplets className="h-5 w-5 text-blue-500" />,
	heating: <Flame className="h-5 w-5 text-red-500" />,
};

// Server Component for content
async function EstimatesContent() {
	// Get the latest metadata
	const metadata = await getTemplateMetadata();

	// Group templates by category
	const groups = metadata.reduce<Record<string, typeof metadata>>((acc, template) => {
		const category = template.category || "other";
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(template);
		return acc;
	}, {});

	return (
		<div className="p-6 space-y-8">
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold">Estimate Templates</h1>
					<Link href="/estimates/registry">
						<Button variant="outline" size="sm">
							<FileText className="mr-2 h-4 w-4" />
							Template Registry
						</Button>
					</Link>
				</div>
				<p className="text-muted-foreground">Choose a template to quickly create a detailed estimate</p>
			</div>

			<div className="grid gap-6">
				{Object.entries(groups).map(([category, templates]) => (
					<div key={category} className="space-y-4">
						<h2 className="text-xl font-semibold capitalize">{category} Templates</h2>
						<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
							{templates.map((template) => (
								<Card key={template.id}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											{templateIconMap[template.category] || <FileText className="h-5 w-5 text-blue-500" />}
											{template.name}
										</CardTitle>
										<CardDescription>{template.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
											<Badge variant="secondary" className="capitalize">
												{template.category}
											</Badge>
										</div>
									</CardContent>
									<CardFooter>
										<Link href={`/estimates/${template.id}`} className="w-full">
											<Button className="w-full">
												<span>Use Template</span>
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										</Link>
									</CardFooter>
								</Card>
							))}
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 border rounded-lg p-6 bg-muted/30">
				<div className="flex items-start gap-4">
					<div className="bg-primary/10 p-3 rounded-full">
						<Calculator className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-medium">Create Custom Estimate</h3>
						<p className="text-muted-foreground mt-1 mb-4">Need a custom estimate? Start from scratch with our estimate builder.</p>
						<Link href="/estimates/new">
							<Button variant="outline">
								<FileText className="mr-2 h-4 w-4" />
								New Custom Estimate
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main page component
export default function EstimatesPage() {
	return (
		<TemplatePageLayout>
			<Suspense fallback={<div className="animate-pulse h-screen w-full bg-muted/20"></div>}>
				<EstimatesContent />
			</Suspense>
		</TemplatePageLayout>
	);
}
