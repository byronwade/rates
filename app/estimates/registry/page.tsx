import { Suspense } from "react";
import { TemplatePageLayout } from "@/components/layout/template-page-layout";
import { getTemplateMetadata, type TemplateMetadataItem } from "@/config/estimates";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Fetch template metadata - server function
async function fetchTemplateMetadata() {
	"use server";
	// Get the latest template metadata
	return await getTemplateMetadata();
}

// Server Component for content
async function TemplateRegistryContent() {
	// Get the latest template metadata
	const metadata = await fetchTemplateMetadata();

	// Group templates by category for display
	const categorizedTemplates = metadata.reduce<Record<string, TemplateMetadataItem[]>>((acc, template) => {
		const category = template.category || "other";
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(template);
		return acc;
	}, {});

	return (
		<div className="p-6 space-y-8">
			<div className="flex justify-between items-center">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold">Template Registry</h1>
					<p className="text-muted-foreground">Manage and navigate all available estimate templates</p>
				</div>
				<Link href="/estimates">
					<Button variant="outline">
						<FileText className="mr-2 h-4 w-4" />
						Back to Estimates
					</Button>
				</Link>
			</div>

			<div className="rounded-lg border overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Template Name</TableHead>
							<TableHead>ID</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{metadata.map((template) => (
							<TableRow key={template.id}>
								<TableCell className="font-medium">{template.name}</TableCell>
								<TableCell>
									<code className="bg-muted px-1.5 py-0.5 rounded text-xs">{template.id}</code>
								</TableCell>
								<TableCell>
									<Badge variant="secondary" className="capitalize">
										{template.category}
									</Badge>
								</TableCell>
								<TableCell className="max-w-md truncate">{template.description}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Link href={`/estimates/templates/${template.id}`}>
											<Button variant="ghost" size="icon" title="Use Template">
												<ArrowRight className="h-4 w-4" />
											</Button>
										</Link>
										<Link href={`/config/estimates/${template.id}.ts`} target="_blank">
											<Button variant="ghost" size="icon" title="View Config">
												<ExternalLink className="h-4 w-4" />
											</Button>
										</Link>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="space-y-8">
				{Object.entries(categorizedTemplates).map(([category, templates]) => (
					<div key={category} className="space-y-4">
						<h2 className="text-xl font-semibold border-b pb-2 capitalize">{category} Templates</h2>
						<div className="grid grid-cols-1 gap-4">
							{templates.map((template) => (
								<div key={template.id} className="p-4 border rounded-lg">
									<div className="flex items-start justify-between">
										<div>
											<h3 className="text-lg font-medium">{template.name}</h3>
											<p className="text-sm text-muted-foreground">{template.description}</p>
										</div>
										<Link href={`/estimates/templates/${template.id}`}>
											<Button>
												Use Template
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										</Link>
									</div>
									<div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												ID: {template.id}
											</Badge>
											<Badge variant="secondary" className="capitalize text-xs">
												{template.category}
											</Badge>
										</div>
										<div className="text-muted-foreground">
											<Link href={`/config/estimates/${template.id}.ts`} target="_blank" className="flex items-center hover:underline">
												<Pencil className="mr-1 h-3 w-3" />
												View Configuration
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Main page component - React Server Component
export default function TemplateRegistryPage() {
	return (
		<TemplatePageLayout>
			<Suspense fallback={<div className="animate-pulse h-screen w-full bg-muted/20"></div>}>
				<TemplateRegistryContent />
			</Suspense>
		</TemplatePageLayout>
	);
}
